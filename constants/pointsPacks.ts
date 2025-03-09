export interface PointsPack {
  id: string;
  points: number;
  price: number;
  savings?: string;
}

export const pointsPacks: PointsPack[] = [
  {
    id: 'starter',
    points: 10000,
    price: 10,
  },
  {
    id: 'popular',
    points: 50000,
    price: 45,
    savings: 'Save 10%',
  },
  {
    id: 'pro',
    points: 95000,
    price: 75,
    savings: 'Save 25%',
  },
  {
    id: 'enterprise',
    points: 300000,
    price: 150,
    savings: 'Save 50%',
  },
];
