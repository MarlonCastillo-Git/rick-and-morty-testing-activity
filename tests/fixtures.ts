import type { Character, CharacterResponse, Episode } from '@/types/rickandmorty';
export const character: Character = {
  id: 1, name: 'Rick Sanchez', status: 'Alive', species: 'Human', type: '',
  gender: 'Male', origin: { name: 'Earth C-137', url: 'https://example.test/1' },
  location: { name: 'Citadel of Ricks', url: 'https://example.test/2' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
  url: 'https://rickandmortyapi.com/api/character/1', created: '2017-11-04T18:48:46.250Z',
};
export const episode: Episode = {
  id: 1, name: 'Pilot', air_date: 'December 2, 2013', episode: 'S01E01',
  characters: [character.url], url: character.episode[0], created: character.created,
};
export const characters: CharacterResponse = {
  info: { count: 1, pages: 3, next: '?page=2', prev: null }, results: [character],
};
