import React from 'react';

export const sightWords = {
  // Short vowels (CVC words)
  shortVowels: [
    'cat', 'bed', 'pig', 'dog', 'sun',
    'map', 'red', 'dig', 'log', 'run',
    'fan', 'jet', 'win', 'fox', 'cup',
    'pan', 'net', 'lip', 'hop', 'bug',
    'rat', 'web', 'zip', 'cot', 'tub',
    'sat', 'leg', 'sit', 'dot', 'mud',
    'tag', 'pen', 'fin', 'pop', 'nut',
    'wag', 'hen', 'pin', 'rod', 'cut'
  ],

  // Consonant digraphs
  digraphs: [
    'ship', 'fish', 'wish', 'rash', 'shell',
    'chat', 'chip', 'chop', 'rich', 'such',
    'thin', 'thick', 'path', 'math', 'with',
    'back', 'sock', 'duck', 'neck', 'rock'
  ],

  // Consonant blends
  blends: [
    'stop', 'snap', 'swim', 'spot', 'slip',
    'flag', 'clip', 'plan', 'glad', 'plus',
    'frog', 'drop', 'grin', 'trap', 'brick'
  ],

  // Long vowels (silent-e)
  longVowels: [
    'cake', 'tape', 'game', 'cape', 'name',
    'kite', 'five', 'dime', 'hide', 'ride',
    'home', 'bone', 'rope', 'hope', 'note',
    'cube', 'mule', 'tune', 'cute', 'fume'
  ],

  // Vowel teams
  vowelTeams: [
    'rain', 'play', 'day', 'say', 'tray',
    'feet', 'see', 'tree', 'seed', 'keep',
    'boat', 'road', 'coat', 'goat', 'float',
    'pie', 'tie', 'lie', 'die'
  ],

  // R-controlled vowels
  rControlled: [
    'car', 'star', 'hard', 'park', 'farm',
    'for', 'fork', 'born', 'corn', 'sort',
    'her', 'fern', 'bird', 'dirt', 'burn'
  ],

  // Diphthongs and variant vowels
  diphthongs: [
    'oil', 'coin', 'toy', 'joy', 'boil', 'join',
    'out', 'cloud', 'cow', 'brown', 'pout', 'frown',
    'book', 'took', 'moon', 'soon', 'food', 'zoo',
    'saw', 'draw', 'lawn', 'fawn', 'haunt', 'fault',
    'new', 'few', 'chew', 'blue', 'clue', 'glue'
  ],

  // Inflected endings
  inflectedEndings: [
    'jumped', 'called', 'wanted',
    'rolled', 'landed', 'painted',
    'running', 'swimming', 'shopping',
    'jumping', 'writing', 'baking'
  ],

  // Multisyllabic words
  multisyllabic: [
    'laptop', 'sunset', 'inside', 'backpack', 'campfire',
    'music', 'baby', 'robot', 'tiger', 'paper',
    'magnet', 'picnic', 'insect', 'problem', 'basket'
  ]
};

export const getRandomWords = (category, count) => {
  if (!sightWords[category]) return [];
  
  const shuffled = [...sightWords[category]].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};