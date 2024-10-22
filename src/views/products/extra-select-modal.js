import { Button, Input, List, Modal, Pagination, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import extraService from 'services/extra';
import ExtraGroupModal from './Extras/extra-group-modal';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import useDebounce from 'helpers/useDebounce';

const ExtraSelectModal = ({ open, onClose, selectedExtras, onSelect }) => {
  const { t } = useTranslation();
  const [extrasGroup, setExtrasGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [meta, setMeta] = useState();
  const getExtraGroup = (query, page = 1) => {
    setLoading(true);
    const params = { valid: true, perPage: 10, search: query, page };
    extraService
      .getAllGroups(params)
      .then((res) => {
        const data = res.data.map((item) => ({
          id: item.id,
          label: item.translation?.title,
          value: item.id,
          shop_id: item.shop_id,
        }));
        setExtrasGroup(data);
        setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  };

  const onChange = (page) => {
    getExtraGroup(debouncedSearch, page);
  };

  useEffect(() => {
    if (open) {
      getExtraGroup(debouncedSearch);
    }
  }, [open, debouncedSearch]);

  return (
    <>
      <Modal
        visible={open}
        onCancel={() => {
          onClose();
          setSearch('');
        }}
        footer={
          !loading ? (
            <Button
              type='link'
              onClick={() => setIsAddModalOpen(true)}
              style={{ paddingLeft: 0 }}
              icon={<PlusOutlined />}
            >
              {t('add.new.extra')}
            </Button>
          ) : null
        }
      >
        <Input
          className='mt-3'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <List
          loading={loading}
          dataSource={extrasGroup.filter(
            (extraItem) =>
              !selectedExtras?.some(
                (selectedExtra) => selectedExtra.id === extraItem.id
              )
          )}
          renderItem={(item) => (
            <List.Item
              extra={!item?.shop_id ? <Tag>{t('admin')}</Tag> : null}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                onSelect(item);
              }}
            >
              {item.label}
            </List.Item>
          )}
        />
        <Pagination
          onChange={onChange}
          current={meta?.current_page}
          total={meta?.total}
        />
      </Modal>
      <ExtraGroupModal
        modal={isAddModalOpen}
        handleCancel={() => setIsAddModalOpen(false)}
        onSuccess={() => getExtraGroup()}
      />
    </>
  );
};

export default ExtraSelectModal;
