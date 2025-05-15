export async function generatePlaylistFromMoods(moods) {
  const moodList = moods.map((mood) => mood.name).join(', ');
  const response = await fetch('/api/generatePlaylist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moods: moodList }),
  });
  const data = await response.json();
  return data.playlist;
}
