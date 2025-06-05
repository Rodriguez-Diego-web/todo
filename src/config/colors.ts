export const listColors = [
  { name: 'Standard', value: '#4b5563', class: 'text-gray-600' },
  { name: 'Rot', value: '#ef4444', class: 'text-red-500' },
  { name: 'Orange', value: '#f97316', class: 'text-orange-500' },
  { name: 'Gelb', value: '#eab308', class: 'text-yellow-500' },
  { name: 'Grün', value: '#22c55e', class: 'text-green-500' },
  { name: 'Türkis', value: '#14b8a6', class: 'text-teal-500' },
  { name: 'Blau', value: '#3b82f6', class: 'text-blue-500' },
  { name: 'Lila', value: '#a855f7', class: 'text-purple-500' },
  { name: 'Pink', value: '#ec4899', class: 'text-pink-500' },
];

export const getListColor = (color?: string) => {
  if (!color) return listColors[0];
  return listColors.find(c => c.value === color) || listColors[0];
}; 