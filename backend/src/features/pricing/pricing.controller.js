'use strict';

const priceListService = require('./priceList.service');
const discountRuleService = require('./discountRule.service');
const upsellRuleService = require('./upsellRule.service');

exports.getPriceLists = async (req, res, next) => {
  try {
    const lists = await priceListService.getPriceLists(req.query);
    res.json({ success: true, data: lists });
  } catch (err) {
    next(err);
  }
};

exports.createPriceList = async (req, res, next) => {
  try {
    const list = await priceListService.createPriceList(req.body);
    res.status(201).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

exports.getDiscountRules = async (req, res, next) => {
  try {
    const rules = await discountRuleService.getRulesForTier(req.query.tier);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

exports.upsertDiscountRule = async (req, res, next) => {
  try {
    const rule = await discountRuleService.upsertDiscountRule(req.body);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};

exports.getUpsellRules = async (req, res, next) => {
  try {
    const rules = await upsellRuleService.listUpsellRules();
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
};

exports.upsertUpsellRule = async (req, res, next) => {
  try {
    const rule = await upsellRuleService.upsertUpsellRule(req.body);
    res.json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
};
