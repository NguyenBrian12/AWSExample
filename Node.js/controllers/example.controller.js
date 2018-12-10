const assetService = require("../services/asset.service");
const responses = require("../models/responses/index");

const getBusinessId = (req, res) => {
  assetService
    .getBusinessId(req.params.appUserId)
    .then(item => {
      res.json(new responses.ItemResponse(item));
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const getAll = (req, res) => {
  const pageIndex = req.params.pageIndex || req.query.pageIndex || null;
  const pageSize = req.params.pageSize || req.query.pageSize || null;
  assetService
    .getAll(pageIndex, pageSize, req.params.businessId)
    .then(item => {
      const r = new responses.ItemResponse(item);
      res.json(r);
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const getById = (req, res) => {
  assetService
    .getById(req.params.id)
    .then(item => {
      res.json(new responses.ItemResponse(item));
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const post = (req, res) => {
  console.log(req);
  console.log(req.model);
  const tenantId = req.user.tenantId;
  assetService
    .post(req.model, tenantId)
    .then(outputParms => {
      res.status(201).json(outputParms);
      console.log(outputParms);
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const put = (req, res) => {
  const tenantId = req.user.tenantId;
  assetService
    .put(req.model, tenantId)
    .then(outputParms => {
      res.status(201).json(outputParms);
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const del = (req, res) => {
  assetService
    .del(req.params.id)
    .then(response => {
      res.sendStatus(200);
    })
    .catch(err => {
      res.set(500).send(err);
    });
};

const search = (req, res) => {
  const searchString = req.params.search || req.query.search || "";
  const pageIndex = req.params.pageIndex || req.query.pageIndex || 0;
  const pageSize = req.params.pageSize || req.query.pageSize || 24;
  const tenantId = req.user.tenantId;

  assetService
    .search(pageIndex, pageSize, searchString, req.params.businessId, tenantId)
    .then(item => {
      const r = new responses.ItemResponse(item);
      res.json(r);
    })
    .catch(err => {
      res.set(500).send(err);
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
