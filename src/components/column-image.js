import { Image } from 'antd';

const ColumnImage = ({ image, id, size = 100 }) => {
  return (
    <Image
      src={image || 'https://via.placeholder.com/150'}
      alt='img_gallery'
      width={size}
      height={size}
      className='rounded border'
      preview={!!image}
      placeholder={!image}
      key={`${image}_${id}`}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default ColumnImage;
