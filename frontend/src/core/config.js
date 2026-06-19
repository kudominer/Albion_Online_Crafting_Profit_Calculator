export const API_SERVERS = [
  { id: 'west', name: 'Americas (West)', url: 'http://localhost:3001/api/prices' },
  { id: 'east', name: 'Asia (East)', url: 'http://localhost:3001/api/prices' },
  { id: 'europe', name: 'Europe', url: 'http://localhost:3001/api/prices' }
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
