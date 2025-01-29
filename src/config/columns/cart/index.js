const columns = [
    {
        title: '商品图片',
        dataIndex: 'image',
        key: 'image',
        scopedSlots: { customRender: 'image' },
    },
    {
        title: '商品名称',
        dataIndex: 'name',
        key: 'name',
        width: '30%',
    },
    {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec',
        width: '20%',
    },
    {
        title: '单价',
        dataIndex: 'price',
        key: 'price',
        customRender: ({ text }) => `¥${(text / 100).toFixed(2)}`,
    },
    {
        title: '数量',
        dataIndex: 'num',
        key: 'num',
    },
    {
        title: '操作',
        key: 'action',
    },
]


export { columns };