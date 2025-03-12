export interface PointsPack {
  id: string;
  points: number;
  price: number;
  savings?: string;
}

export const pointsPacks: PointsPack[] = [
  {
    id: 'starter',
    points: 5000,
    price: 10.00,
  },
  {
    id: 'popular',
    points: 10000,
    price: 18.00,
    savings: 'Save 10%',
  },
  {
    id: 'pro',
    points: 20000,
    price: 30.00,
    savings: 'Save 25%',
  },
  {
    id: 'Extra',
    points: 40000,
    price: 40.00,
    savings: 'Save 50%',
  },
];
