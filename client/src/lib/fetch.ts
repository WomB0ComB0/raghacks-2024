export async function getSearchResults(
  searchParams: string,
): Promise<SearchQueryResult[] | undefined> {
  if (searchParams === '') return undefined;
  try {
    const res = await fetch(
      `https://dictionaryapi.com/api/v3/references/medical/json/${searchParams}?key=${process.env.DICTIONARY_API_KEY}`,
    );
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: SearchQueryResult[] = (await res.json()) as SearchQueryResult[];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return undefined;
  }
}
