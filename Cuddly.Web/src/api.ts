import { API_URL } from "./config";

export async function GetSpellImageUrl(spellId: number) {
    const response = await fetch(`${API_URL}/media-urls/spells/${spellId}`);
    return await response.text();
};