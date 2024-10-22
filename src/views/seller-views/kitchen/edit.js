import kitchenService from 'services/seller/kitchen';
import { useParams } from 'react-router-dom';
import KitchenForm from './components/form';

const KitchenEdit = () => {
  const { id } = useParams();
  const handleCreate = (body) => {
    return kitchenService.update(id, body);
  };
  return <KitchenForm handleSubmit={handleCreate} />;
};

export default KitchenEdit;
