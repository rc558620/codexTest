import CryptoJS from 'crypto-js';
import { DataCenterConfig } from '@/utils/Constant';

const { accessKey, secretKey, remoteHost, apiPrefix } = DataCenterConfig;

let { authVersion, expirationInSeconds, signedHeaders } = DataCenterConfig;

function getTimestamp() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

function normalize(string: string, encodingSlash?: boolean) {
  const kEscapedMap = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A',
  };

  if (string === null) {
    return '';
  }
  let result = encodeURIComponent(string);
  result = result.replace(/[!'()*]/g, function ($1) {
    return kEscapedMap[$1 as keyof typeof kEscapedMap];
  });

  if (encodingSlash === false) {
    result = result.replace(/%2F/gi, '/');
  }

  return result;
}

let g_signed_headers = '';

export function generateAuthorization(
  url: string,
  options: { method?: string; params?: object; data?: object },
) {
  const path = `${remoteHost}${url.replaceAll(apiPrefix, '')}`;

  const method = options.method?.toUpperCase() ?? 'GET';

  const params = Object.keys(options.params ?? {}).map((k) => ({
    key: k,
    value: options.params?.[k as keyof typeof options.params] ?? '',
  }));

  function generateCanonicalQueryString() {
    const queryList = params;
    const normalizedQueryList = [];
    for (let i = 0; i < queryList.length; i++) {
      if (queryList[i].key.toLowerCase() === 'authorization') {
        continue;
      }
      normalizedQueryList.push(`${normalize(queryList[i].key)}=${normalize(queryList[i].value)}`);
    }
    normalizedQueryList.sort();
    return normalizedQueryList.join('&');
  }

  function generateCanonicalHeaders() {
    let keyStrList = [];
    const urlObj = new URL(path);
    const headerList = {
      host: urlObj.host,
    };

    signedHeaders = signedHeaders.trim();
    keyStrList = signedHeaders.split(';');
    for (let i = 0; i < keyStrList.length; i++) {
      keyStrList[i] = keyStrList[i].toLowerCase();
    }
    if (!keyStrList.includes('host')) {
      keyStrList.push('host');
    }
    const usedHeaderStrList = [];
    for (let i = 0; i < keyStrList.length; i++) {
      let key = keyStrList[i];
      let value = headerList[key as keyof typeof headerList];
      if (!value || value === '') {
        continue;
      }
      key = key.toLowerCase();
      value = value.trim();
      usedHeaderStrList.push(`${normalize(key)}:${normalize(value)}`);
    }

    usedHeaderStrList.sort();
    const usedHeaderKeys: string[] = [];
    usedHeaderStrList.forEach(function (item) {
      usedHeaderKeys.push(item.split(':')[0]);
    });
    const canonicalHeaderStr = usedHeaderStrList.join('\n');
    g_signed_headers = usedHeaderKeys.join(';');
    return canonicalHeaderStr;
  }

  function generateCanonicalUri() {
    const urlObj = new URL(path);
    const resources = urlObj.pathname.substring(1).split('/');
    if (!resources) {
      return '';
    }
    let normalizedResourceStr = '';
    for (let i = 0; i < resources.length; i++) {
      normalizedResourceStr += `/${normalize(resources[i])}`;
    }
    return normalizedResourceStr;
  }

  const timestamp = getTimestamp();

  authVersion = !authVersion ? '1' : authVersion.trim();
  expirationInSeconds = !expirationInSeconds ? '1800' : expirationInSeconds.trim();
  const signingKeyStr = `bce-auth-v${authVersion}/${accessKey.trim()}/${timestamp}/${expirationInSeconds}`;
  const signingKey = CryptoJS.HmacSHA256(signingKeyStr, secretKey.trim());

  const canonicalUri = generateCanonicalUri();

  const canonicalQueryString = generateCanonicalQueryString();

  const canonicalHeaders = generateCanonicalHeaders();

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}`;

  const signature = CryptoJS.HmacSHA256(canonicalRequest, signingKey.toString());

  const Authorization = `${signingKeyStr}/${g_signed_headers}/${signature.toString()}`;

  // console.log(`X-Bce-Signature: ${Authorization}`);
  return Authorization;
}
