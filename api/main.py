from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import geocoder
import logging
from dotenv import load_dotenv
import os
from azure.maps.search import MapsSearchClient
from azure.core.credentials import AzureKeyCredential
from groq import Groq
import httpx

load_dotenv(dotenv_path=".env")

LLAMA_API_KEY = os.getenv("LLAMA_KEY")
LLAMA_DEPLOYMENT = os.getenv("LLAMA_DEPLOYMENT_VERSION")
AZURE_MAPS_KEY = os.getenv("AZURE_MAPS_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT", "https://atlas.microsoft.com/")

# Clients
llama_client = Groq(api_key=LLAMA_API_KEY)
client_maps = MapsSearchClient(
    endpoint=AZURE_ENDPOINT, credential=AzureKeyCredential(AZURE_MAPS_KEY)
)

app = FastAPI()

logging.basicConfig(level=logging.INFO)


class Location(BaseModel):
    latitude: float
    longitude: float


@app.get("/coordinates/")
async def get_current_gps_coordinates():
    g = geocoder.ip("me")
    if g.latlng:
        return {"latitude": g.latlng[0], "longitude": g.latlng[1]}
    else:
        raise HTTPException(
            status_code=404, detail="Unable to retrieve GPS coordinates."
        )


@app.get("/poi/")
async def get_poi(latitude: float, longitude: float, poi_type: str):
    try:
        result = await get_localized_information(latitude, longitude, poi_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Hello World"}


async def search_poi(location, poi_type):
    url = f"{AZURE_ENDPOINT}search/poi/json"
    params = {
        "api-version": "1.0",
        "subscription-key": AZURE_MAPS_KEY,
        "query": poi_type,
        "limit": 1,
        "lat": location["latitude"],
        "lon": location["longitude"],
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
    response.raise_for_status()
    return response.json()

async def get_localized_information(latitude, longitude, poi_type):
    location = {"latitude": latitude, "longitude": longitude}
    query = {
        "location": f"latitude {latitude}, longitude {longitude}",
        "type": poi_type,
    }
    processed_query = await process_query(query)
    poi_info = await search_poi(location, poi_type)
    poi_name = poi_info["results"][0]["poi"]["name"]
    poi_address = poi_info["results"][0]["address"]["freeformAddress"]
    return {"query": processed_query, "nearest_place": poi_name, "address": poi_address}


async def process_query(query):
    completion = llama_client.chat.completions.create(
        model=LLAMA_DEPLOYMENT,
        messages=[
            {
                "role": "system",
                "content": "You are an assistant providing geospatial information.",
            },
            {
                "role": "user",
                "content": f"Find the nearest {query['type']} to the location {query['location']}.",
            },
        ],
        temperature=1,
        max_tokens=300,
        top_p=1,
        stream=False,
        stop=None,
    )
    return completion.choices[0].message.content
