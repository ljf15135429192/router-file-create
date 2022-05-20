// 企业经营--前台

const businessManagementRouter = [
    // 荣誉荣耀详情
    {
      path: '/businessHonorDetail',
      name: 'businessWebsiteHonorDetail',
      component: () =>
        import('@/views/app_h5/BusinessManagement/websiteHonorDetail.vue'),
      meta: {
        title: ' 荣誉荣耀'
      }
    },
    // 专项资质详情
    {
      path: '/businessSpecialDetail',
      name: 'businessWebsiteSpecialDetail',
      component: () =>
        import('@/views/app_h5/BusinessManagement/websiteSpecialDetail.vue'),
      meta: {
        title: '专项资质'
      }
    },
    // 专项资产详情
    {
      path: '/businessSpecificAssetsDetail',
      name: 'businessWebsiteSpecificAssetsDetail',
      component: () =>
        import('@/views/app_h5/BusinessManagement/websiteSpecificAssetsDetail.vue'),
      meta: {
        title: '专项资产'
      }
    }
  ]
  
  export default businessManagementRouter
  