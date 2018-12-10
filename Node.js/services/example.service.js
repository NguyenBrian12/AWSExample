const mssql = require("../../mssql");
const TYPES = require("tedious").TYPES;
const toCamel = require("./toCamel.js");
const getBusinessId = appUserId => {
  return mssql
    .executeProc("Business_SelectByUserAppId", sqlRequest => {
      sqlRequest.addParameter("appUserId", TYPES.Int, appUserId);
    })
    .then(response => {
      const convertToCamel = toCamel(response.resultSets[0]);
      return convertToCamel;
    });
};

const getAll = (pageIndex, pageSize, businessId) => {
  return mssql
    .executeProc("Asset_SelectAll", sqlRequest => {
      sqlRequest.addParameter("pageIndex", TYPES.Int, pageIndex);
      sqlRequest.addParameter("pageSize", TYPES.Int, pageSize);
      sqlRequest.addParameter("customerBusinessId", TYPES.Int, businessId);
    })
    .then(response => {
      const totalCount =
        (response.resultSets &&
          response.resultSets[0] &&
          response.resultSets[0][0] &&
          response.resultSets[0][0].TotalRows) ||
        0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const item = {
        pageItems: response.resultSets[0],
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: totalPages
      };
      const convertToCamel = toCamel(item);
      return convertToCamel;
    });
};

const getById = id => {
  return mssql
    .executeProc("Asset_SelectById", sqlRequest => {
      sqlRequest.addParameter("Id", TYPES.Int, id);
    })
    .then(response => {
      const convertToCamel = toCamel(response.resultSets[0]);
      return convertToCamel;
    });
};

const post = (item, tenantId) => {
  return mssql
    .executeProc("Asset_Insert", sqlRequest => {
      sqlRequest.addParameter("Url", TYPES.NVarChar, item.url, {
        length: 400
      });
      sqlRequest.addParameter("Name", TYPES.NVarChar, item.name, {
        length: 50
      });
      sqlRequest.addParameter("Description", TYPES.NVarChar, item.description, {
        length: 150
      });
      sqlRequest.addParameter("TypeId", TYPES.Int, item.typeId);
      sqlRequest.addParameter("AppUserId", TYPES.Int, item.appUserId);
      sqlRequest.addParameter("BusinessId", TYPES.Int, item.businessId);
      sqlRequest.addParameter("tenantId", TYPES.Int, tenantId);
      sqlRequest.addOutputParameter("Id", TYPES.Int, null);
    })
    .then(response => {
      return response.outputParameters;
      console.log(response.outputParameters);
    });
};
const put = (item, tenantId) => {
  console.log(item);
  return mssql
    .executeProc("Asset_Update", sqlRequest => {
      sqlRequest.addParameter("Url", TYPES.NVarChar, item.url, {
        length: 400
      });
      sqlRequest.addParameter("Name", TYPES.NVarChar, item.name, {
        length: 50
      });
      sqlRequest.addParameter("Description", TYPES.NVarChar, item.description, {
        length: 150
      });
      sqlRequest.addParameter("TypeId", TYPES.Int, item.typeId);
      sqlRequest.addParameter("AppUserId", TYPES.Int, item.appUserId);
      sqlRequest.addParameter("TenantId", TYPES.Int, tenantId);
      sqlRequest.addOutputParameter("Id", TYPES.Int, item.id);
    })
    .then(response => {
      return true;
    });
};

const del = id => {
  return mssql.executeProc("Asset_Delete", sqlRequest => {
    sqlRequest.addParameter("Id", TYPES.Int, id);
  });
};
const search = (pageIndex, pageSize, searchString, businessId, tenantId) => {
  return mssql
    .executeProc("Asset_Search", sqlRequest => {
      sqlRequest.addParameter("Search", TYPES.NVarChar, searchString, {
        length: 50
      });
      sqlRequest.addParameter("pageIndex", TYPES.Int, pageIndex);
      sqlRequest.addParameter("pageSize", TYPES.Int, pageSize);
      sqlRequest.addParameter("BusinessId", TYPES.Int, businessId);
      sqlRequest.addParameter("tenantId", TYPES.Int, tenantId);
    })
    .then(response => {
      const totalCount =
        (response.resultSets &&
          response.resultSets[0] &&
          response.resultSets[0][0] &&
          response.resultSets[0][0].TotalRows) ||
        0;
      const totalPages = Math.ceil(totalCount / pageSize);

      const item = {
        pageItems: response.resultSets[0],
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalCount: totalCount,
        totalPages: totalPages
      };
      const convertToCamel = toCamel(item);
      return convertToCamel;
    });
};
module.exports = {
  getAll,
  getById,
  search,
  post,
  put,
  del,
  getBusinessId
};
