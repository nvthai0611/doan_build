import './Home.scss';
import Carousel from './Carousel';
import BestSeller from './BestSeller';
import { useQueries } from '@tanstack/react-query';
import { apiClient } from '../../utils/clientAxios';

interface User {
  id: number;
  name: string;
}

const Home = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['users'],
        queryFn: async () => {
          const res = await apiClient.get<User[]>('/');
          return res.data;
        },
      },
      {
        queryKey: ['posts'],
        queryFn: async () => {
          const res = await apiClient.post('/posts', {
            name: 'Hải',
            price: 20,
          });
          return res.data;
        },
      },
    ],
  });

  const usersQuery = results[0];
  const postsQuery = results[1];

  if (usersQuery.isLoading || postsQuery.isLoading) return <p>Loading...</p>;
  if (usersQuery.error || postsQuery.error) return <p>Something went wrong</p>;

  return (
    <div>
      <h1>Home check 132</h1>
      <pre>{JSON.stringify(usersQuery.data, null, 2)}</pre>
      <pre>{JSON.stringify(postsQuery.data, null, 2)}</pre>
      <Carousel />
      <BestSeller />
    </div>
  );
};

export default Home;
