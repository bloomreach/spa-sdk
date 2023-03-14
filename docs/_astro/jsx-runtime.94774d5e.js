import{r as i}from"./index.f1bc5ebf.js";const a={English:"en"};Object.values(a);const v={indexName:"XXXXXXXXXX",appId:"XXXXXXXXXX",apiKey:"XXXXXXXXXX"};var _={},u={get exports(){return _},set exports(t){_=t}},n={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var l=i,m=Symbol.for("react.element"),c=Symbol.for("react.fragment"),x=Object.prototype.hasOwnProperty,y=l.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,O={key:!0,ref:!0,__self:!0,__source:!0};function f(t,e,s){var r,o={},X=null,p=null;s!==void 0&&(X=""+s),e.key!==void 0&&(X=""+e.key),e.ref!==void 0&&(p=e.ref);for(r in e)x.call(e,r)&&!O.hasOwnProperty(r)&&(o[r]=e[r]);if(t&&t.defaultProps)for(r in e=t.defaultProps,e)o[r]===void 0&&(o[r]=e[r]);return{$$typeof:m,type:t,key:X,ref:p,props:o,_owner:y.current}}n.Fragment=c;n.jsx=f;n.jsxs=f;(function(t){t.exports=n})(u);export{v as A,a as K,_ as j};
