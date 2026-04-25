import { Word } from '../types';

export const VOCABULARY: Record<number, Word[]> = {
  1: [
    { id: '1-1', english: 'apple', phonetic: '[ˈæpl]', reading: '애플', korean: '사과', example: 'I eat an apple every morning.' },
    { id: '1-2', english: 'book', phonetic: '[bʊk]', reading: '북', korean: '책', example: 'I read a fun book.' },
    { id: '1-3', english: 'cat', phonetic: '[kæt]', reading: '캣', korean: '고양이', example: 'My cat is very cute.' },
    { id: '1-4', english: 'dog', phonetic: '[dɔːɡ]', reading: '독', korean: '개', example: 'The dog is barking.' },
    { id: '1-5', english: 'elephant', phonetic: '[ˈelɪfənt]', reading: '엘리펀트', korean: '코끼리', example: 'The elephant is big.' },
    { id: '1-6', english: 'friend', phonetic: '[frend]', reading: '프렌드', korean: '친구', example: 'He is my best friend.' },
    { id: '1-7', english: 'grape', phonetic: '[ɡreɪp]', reading: '그레이프', korean: '포도', example: 'I like purple grapes.' },
    { id: '1-8', english: 'house', phonetic: '[haʊs]', reading: '하우스', korean: '집', example: 'We live in a small house.' },
    { id: '1-9', english: 'ice', phonetic: '[aɪs]', reading: '아이스', korean: '얼음', example: 'Put some ice in the water.' },
    { id: '1-10', english: 'jump', phonetic: '[dʒʌmp]', reading: '점프', korean: '점프하다', example: 'Can you jump high?' },
  ],
  2: [
    { id: '2-1', english: 'king', phonetic: '[kɪŋ]', reading: '킹', korean: '왕', example: 'The king lives in a castle.' },
    { id: '2-2', english: 'lion', phonetic: '[ˈlaɪən]', reading: '라이온', korean: '사자', example: 'The lion is the king of the jungle.' },
    { id: '2-3', english: 'monkey', phonetic: '[ˈmʌŋki]', reading: '멍키', korean: '원숭이', example: 'The monkey eats a banana.' },
    { id: '2-4', english: 'nose', phonetic: '[noʊz]', reading: '노즈', korean: '코', example: 'Touch your nose.' },
    { id: '2-5', english: 'orange', phonetic: '[ˈɔːrɪndʒ]', reading: '오렌지', korean: '오렌지', example: 'This orange is sweet.' },
    { id: '2-6', english: 'pencil', phonetic: '[ˈpensl]', reading: '펜슬', korean: '연필', example: 'I need a pencil to write.' },
    { id: '2-7', english: 'queen', phonetic: '[kwiːn]', reading: '퀸', korean: '여왕', example: 'The queen has a crown.' },
    { id: '2-8', english: 'rabbit', phonetic: '[ˈræbɪt]', reading: '래빗', korean: '토끼', example: 'The rabbit is fast.' },
    { id: '2-9', english: 'school', phonetic: '[skuːl]', reading: '스쿨', korean: '학교', example: 'I go to school by bus.' },
    { id: '2-10', english: 'tiger', phonetic: '[ˈtaɪɡər]', reading: '타이거', korean: '호랑이', example: 'The tiger is a powerful animal.' },
  ],
  3: [
    { id: '3-1', english: 'umbrella', phonetic: '[ʌmˈbrelə]', reading: '엄브렐라', korean: '우산', example: 'Take an umbrella, it is raining.' },
    { id: '3-2', english: 'violin', phonetic: '[ˌvaɪəˈlɪn]', reading: '바이올린', korean: '바이올린', example: 'She plays the violin beautifully.' },
    { id: '3-3', english: 'water', phonetic: '[ˈwɔːtər]', reading: '워터', korean: '물', example: 'I drink eight glasses of water.' },
    { id: '3-4', english: 'xylophone', phonetic: '[ˈzaɪləfoʊn]', reading: '자일로폰', korean: '실로폰', example: 'The child is playing the xylophone.' },
    { id: '3-5', english: 'yellow', phonetic: '[ˈjeloʊ]', reading: '옐로우', korean: '노란색', example: 'Sunflowers are yellow.' },
    { id: '3-6', english: 'zebra', phonetic: '[ˈziːbrə]', reading: '지브라', korean: '얼룩말', example: 'The zebra has black and white stripes.' },
    { id: '3-7', english: 'bread', phonetic: '[bred]', reading: '브레드', korean: '빵', example: 'I like toasted bread for breakfast.' },
    { id: '3-8', english: 'cheese', phonetic: '[tʃiːz]', reading: '치즈', korean: '치즈', example: 'This pizza has extra cheese.' },
    { id: '3-9', english: 'desk', phonetic: '[desk]', reading: '데스크', korean: '책상', example: 'Put your books on the desk.' },
    { id: '3-10', english: 'egg', phonetic: '[eɡ]', reading: '에그', korean: '달걀', example: 'I eat an egg every day.' },
  ]
  // In a real app, we would have Day 1-60.
};

export const getWordsForDay = (day: number): Word[] => {
  return VOCABULARY[day] || VOCABULARY[1];
};
