const DEFAULT_BASE = 'https://ima.qq.com';

async function imaPost(apiPath, body, config = {}) {
  if (!config.clientId || !config.apiKey || !config.knowledgeBaseId) {
    throw new Error('IMA_NOT_CONFIGURED');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs || 20000);
  try {
    const response = await fetch(`${config.baseUrl || DEFAULT_BASE}${apiPath}`, {
      method: 'POST',
      headers: {
        'ima-openapi-clientid': config.clientId,
        'ima-openapi-apikey': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error(`IMA_INVALID_JSON_${response.status}`); }
    if (!response.ok || data.code !== 0) throw new Error(`IMA_ERROR_${data.code ?? response.status}: ${data.msg || 'request failed'}`);
    return data;
  } finally { clearTimeout(timer); }
}

async function searchKnowledge(query, config) {
  const data = await imaPost('/openapi/wiki/v1/search_knowledge', {
    query, cursor: '', knowledge_base_id: config.knowledgeBaseId
  }, config);
  return (data.data?.info_list || []).map(item => ({
    id: item.media_id, title: item.title, highlight: item.highlight_content || '', source: 'ima'
  }));
}

async function getMediaInfo(mediaId, config) {
  const data = await imaPost('/openapi/wiki/v1/get_media_info', { media_id: mediaId }, config);
  return { id: mediaId, mediaType: data.data?.media_type, urlInfo: data.data?.url_info, source: 'ima' };
}

module.exports = { imaPost, searchKnowledge, getMediaInfo };
