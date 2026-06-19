export const API_SERVERS = [
  { id: 'west', name: 'Americas (West)', url: 'https://west.albion-online-data.com/api/v2/stats/prices' },
  { id: 'east', name: 'Asia (East)', url: 'https://east.albion-online-data.com/api/v2/stats/prices' },
  { id: 'europe', name: 'Europe', url: 'https://europe.albion-online-data.com/api/v2/stats/prices' }
];

export const CITIES = [
  { id: '', name: 'Tất cả thành phố (Min/Max)' },
  { id: 'Caerleon', name: 'Caerleon' },
  { id: 'Bridgewatch', name: 'Bridgewatch' },
  { id: 'Martlock', name: 'Martlock' },
  { id: 'Thetford', name: 'Thetford' },
  { id: 'Fort Sterling', name: 'Fort Sterling' },
  { id: 'Lymhurst', name: 'Lymhurst' },
  { id: 'Brecilien', name: 'Brecilien' }
];

export const DEFAULT_SETTINGS = {
  rrr: '15.2',
  tax: '6.5',
  craftFee: '',
  server: 'europe'
};
