import kitchenService from 'services/seller/kitchen';
import KitchenForm from './components/form';

const KitchenCreate = () => {
  const handleCreate = (body) => {
    return kitchenService.create(body);
  };
  return <KitchenForm handleSubmit={handleCreate} />;
};

export default KitchenCreate;
