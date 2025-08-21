import './Home.scss';
import Carousel from './Carousel';
import BestSeller from './BestSeller';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/clientAxios';

// Bắt buộc phải có interface mặc dù nó ko validation
interface User {
  id: number;
  name: string;
}


const Home = () => {

  // Call api như sau
  const { data, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get<User[]>('/');
      console.log(res.data);
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong</p>;

  return (
    <div>
      <h1>Home check 132</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Carousel />
      <BestSeller />
    </div>
  );
};

export default Home;
