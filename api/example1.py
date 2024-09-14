from groq import Groq
import requests
import os
from azure.identity import DefaultAzureCredential
from azure.maps.search import MapsSearchClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
import geocoder
# Load environment variables from the .env file
load_dotenv()

LLAMA_API_KEY = os.getenv('LLAMA_KEY')
LLAMA_DEPLOYMENT = os.getenv('LLAMA_DEPLOYMENT_VERSION')
AZURE_MAPS_KEY = '6tTgAoW6inJAdK4BWCgzjbyG7ULZjU45dKiRFitLfHjUPcu1o9ZnJQQJ99AIACYeBjFuPQS6AAAgAZMPBkmY'
llama_client = Groq(api_key=LLAMA_API_KEY)

client_maps = MapsSearchClient(
    endpoint="https://atlas.microsoft.com/",
    credential=AzureKeyCredential(AZURE_MAPS_KEY)
)

# Function to search for a POI (Point of Interest) using Azure Maps
def search_poi(location, poi_type):
    url = 'https://atlas.microsoft.com/search/poi/json'
    params = {
        'api-version': '1.0',
        'subscription-key': AZURE_MAPS_KEY,
        'query': poi_type,
        'limit': 1,
        'lat': location['latitude'],
        'lon': location['longitude']
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Full response: {response.text}")
        raise Exception(f"Error searching for POI: {response.status_code}")

# Function to process a query using a language model (LLAMA in this case)
def process_query(query):
    answer = ""
    
    completion = llama_client.chat.completions.create(
        model=LLAMA_DEPLOYMENT,
        messages=[
            {
                "role": "system",
                "content": "You are an assistant providing geospatial information."
            },
            {
                "role": "user",
                "content": f"Find the nearest {query['type']} to the location {query['location']}."
            }
        ],
        temperature=1,
        max_tokens=300,
        top_p=1,
        stream=True,
        stop=None,
    )
    for chunk in completion:
        answer += chunk.choices[0].delta.content or ""  
    return answer.strip()

# Function to get localized information by combining processed query and POI data
def get_localized_information(location, poi_type):
    query = {'location': f"latitude {location['latitude']}, longitude {location['longitude']}", 'type': poi_type}
    processed_query = process_query(query)
    
    # Search for the nearest POI using Azure Maps
    poi_info = search_poi(location, poi_type)
    
    
    # Extract the name and address of the POI
    poi_name = poi_info['results'][0]['poi']['name']
    poi_address = poi_info['results'][0]['address']['freeformAddress']
    
    # Combine the processed query and POI information into a response
    response = f"{processed_query}. The nearest place is {poi_name}, located at {poi_address}."
    
    return response

def get_current_gps_coordinates():
    g = geocoder.ip('me')#this function is used to find the current information using our IP Add
    if g.latlng is not None: #g.latlng tells if the coordiates are found or not
        return g.latlng
    else:
        return None

# Example usage
if __name__ == '__main__':
    
    coordinates = get_current_gps_coordinates()
    if coordinates is not None:
        latitude, longitude = coordinates
        print(f"Your current GPS coordinates are:")
        print(f"Latitude: {latitude}")
        print(f"Longitude: {longitude}")
    else:
        print("Unable to retrieve your GPS coordinates.")
    location = {'latitude': latitude, 'longitude': longitude}  # Location in New York
    poi_type = 'restaurant'

    try:
        response = get_localized_information(location, poi_type)
        print(response)
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        
        