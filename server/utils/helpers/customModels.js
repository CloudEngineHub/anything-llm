const { fetchOpenRouterModels } = require("../AiProviders/openRouter");
const { fetchApiPieModels } = require("../AiProviders/apipie");
const { perplexityModels } = require("../AiProviders/perplexity");
const { fireworksAiModels } = require("../AiProviders/fireworksAi");
const { ElevenLabsTTS } = require("../TextToSpeech/elevenLabs");
const { fetchNovitaModels } = require("../AiProviders/novita");
const { parseLMStudioBasePath } = require("../AiProviders/lmStudio");
const { parseNvidiaNimBasePath } = require("../AiProviders/nvidiaNim");
const { fetchPPIOModels } = require("../AiProviders/ppio");
const { GeminiLLM } = require("../AiProviders/gemini");

const SUPPORT_CUSTOM_MODELS = [
  "openai",
  "anthropic",
  "localai",
  "ollama",
  "togetherai",
  "fireworksai",
  "nvidia-nim",
  "mistral",
  "perplexity",
  "openrouter",
  "lmstudio",
  "koboldcpp",
  "litellm",
  "elevenlabs-tts",
  "groq",
  "deepseek",
  "apipie",
  "novita",
  "xai",
  "gemini",
  "ppio",
  "dpais",
  "moonshotai",
  // Embedding Engines
  "native-embedder",
];

async function getCustomModels(provider = "", apiKey = null, basePath = null) {
  if (!SUPPORT_CUSTOM_MODELS.includes(provider))
    return { models: [], error: "Invalid provider for custom models" };

  switch (provider) {
    case "openai":
      return await openAiModels(apiKey);
    case "anthropic":
      return await anthropicModels(apiKey);
    case "localai":
      return await localAIModels(basePath, apiKey);
    case "ollama":
      return await ollamaAIModels(basePath, apiKey);
    case "togetherai":
      return await getTogetherAiModels(apiKey);
    case "fireworksai":
      return await getFireworksAiModels(apiKey);
    case "mistral":
      return await getMistralModels(apiKey);
    case "perplexity":
      return await getPerplexityModels();
    case "openrouter":
      return await getOpenRouterModels();
    case "lmstudio":
      return await getLMStudioModels(basePath);
    case "koboldcpp":
      return await getKoboldCPPModels(basePath);
    case "litellm":
      return await liteLLMModels(basePath, apiKey);
    case "elevenlabs-tts":
      return await getElevenLabsModels(apiKey);
    case "groq":
      return await getGroqAiModels(apiKey);
    case "deepseek":
      return await getDeepSeekModels(apiKey);
    case "apipie":
      return await getAPIPieModels(apiKey);
    case "novita":
      return await getNovitaModels();
    case "xai":
      return await getXAIModels(apiKey);
    case "nvidia-nim":
      return await getNvidiaNimModels(basePath);
    case "gemini":
      return await getGeminiModels(apiKey);
    case "ppio":
      return await getPPIOModels(apiKey);
    case "dpais":
      return await getDellProAiStudioModels(basePath);
    case "moonshotai":
      return await getMoonshotAiModels(apiKey);
    case "native-embedder":
      return await getNativeEmbedderModels();
    default:
      return { models: [], error: "Invalid provider for custom models" };
  }
}

async function openAiModels(apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    apiKey: apiKey || process.env.OPEN_AI_KEY,
  });
  const allModels = await openai.models
    .list()
    .then((results) => results.data)
    .catch((e) => {
      console.error(`OpenAI:listModels`, e.message);
      return [
        {
          name: "gpt-3.5-turbo",
          id: "gpt-3.5-turbo",
          object: "model",
          created: 1677610602,
          owned_by: "openai",
          organization: "OpenAi",
        },
        {
          name: "gpt-4o",
          id: "gpt-4o",
          object: "model",
          created: 1677610602,
          owned_by: "openai",
          organization: "OpenAi",
        },
        {
          name: "gpt-4",
          id: "gpt-4",
          object: "model",
          created: 1687882411,
          owned_by: "openai",
          organization: "OpenAi",
        },
        {
          name: "gpt-4-turbo",
          id: "gpt-4-turbo",
          object: "model",
          created: 1712361441,
          owned_by: "system",
          organization: "OpenAi",
        },
        {
          name: "gpt-4-32k",
          id: "gpt-4-32k",
          object: "model",
          created: 1687979321,
          owned_by: "openai",
          organization: "OpenAi",
        },
        {
          name: "gpt-3.5-turbo-16k",
          id: "gpt-3.5-turbo-16k",
          object: "model",
          created: 1683758102,
          owned_by: "openai-internal",
          organization: "OpenAi",
        },
      ];
    });

  const gpts = allModels
    .filter(
      (model) =>
        (model.id.includes("gpt") && !model.id.startsWith("ft:")) ||
        model.id.startsWith("o") // o1, o1-mini, o3, etc
    )
    .filter(
      (model) =>
        !model.id.includes("vision") &&
        !model.id.includes("instruct") &&
        !model.id.includes("audio") &&
        !model.id.includes("realtime") &&
        !model.id.includes("image") &&
        !model.id.includes("moderation") &&
        !model.id.includes("transcribe")
    )
    .map((model) => {
      return {
        ...model,
        name: model.id,
        organization: "OpenAi",
      };
    });

  const customModels = allModels
    .filter(
      (model) =>
        !model.owned_by.includes("openai") && model.owned_by !== "system"
    )
    .map((model) => {
      return {
        ...model,
        name: model.id,
        organization: "Your Fine-Tunes",
      };
    });

  // Api Key was successful so lets save it for future uses
  if ((gpts.length > 0 || customModels.length > 0) && !!apiKey)
    process.env.OPEN_AI_KEY = apiKey;
  return { models: [...gpts, ...customModels], error: null };
}

async function anthropicModels(_apiKey = null) {
  const apiKey =
    _apiKey === true
      ? process.env.ANTHROPIC_API_KEY
      : _apiKey || process.env.ANTHROPIC_API_KEY || null;
  const AnthropicAI = require("@anthropic-ai/sdk");
  const anthropic = new AnthropicAI({ apiKey });
  const models = await anthropic.models
    .list()
    .then((results) => results.data)
    .then((models) => {
      return models
        .filter((model) => model.type === "model")
        .map((model) => {
          return {
            id: model.id,
            name: model.display_name,
          };
        });
    })
    .catch((e) => {
      console.error(`Anthropic:listModels`, e.message);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.ANTHROPIC_API_KEY = apiKey;
  return { models, error: null };
}

async function localAIModels(basePath = null, apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    baseURL: basePath || process.env.LOCAL_AI_BASE_PATH,
    apiKey: apiKey || process.env.LOCAL_AI_API_KEY || null,
  });
  const models = await openai.models
    .list()
    .then((results) => results.data)
    .catch((e) => {
      console.error(`LocalAI:listModels`, e.message);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.LOCAL_AI_API_KEY = apiKey;
  return { models, error: null };
}

async function getGroqAiModels(_apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const apiKey =
    _apiKey === true
      ? process.env.GROQ_API_KEY
      : _apiKey || process.env.GROQ_API_KEY || null;
  const openai = new OpenAIApi({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey,
  });
  const models = (
    await openai.models
      .list()
      .then((results) => results.data)
      .catch((e) => {
        console.error(`GroqAi:listModels`, e.message);
        return [];
      })
  ).filter(
    (model) => !model.id.includes("whisper") && !model.id.includes("tool-use")
  );

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.GROQ_API_KEY = apiKey;
  return { models, error: null };
}

async function liteLLMModels(basePath = null, apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    baseURL: basePath || process.env.LITE_LLM_BASE_PATH,
    apiKey: apiKey || process.env.LITE_LLM_API_KEY || null,
  });
  const models = await openai.models
    .list()
    .then((results) => results.data)
    .catch((e) => {
      console.error(`LiteLLM:listModels`, e.message);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.LITE_LLM_API_KEY = apiKey;
  return { models, error: null };
}

async function getLMStudioModels(basePath = null) {
  try {
    const { OpenAI: OpenAIApi } = require("openai");
    const openai = new OpenAIApi({
      baseURL: parseLMStudioBasePath(
        basePath || process.env.LMSTUDIO_BASE_PATH
      ),
      apiKey: null,
    });
    const models = await openai.models
      .list()
      .then((results) => results.data)
      .catch((e) => {
        console.error(`LMStudio:listModels`, e.message);
        return [];
      });

    return { models, error: null };
  } catch (e) {
    console.error(`LMStudio:getLMStudioModels`, e.message);
    return { models: [], error: "Could not fetch LMStudio Models" };
  }
}

async function getKoboldCPPModels(basePath = null) {
  try {
    const { OpenAI: OpenAIApi } = require("openai");
    const openai = new OpenAIApi({
      baseURL: basePath || process.env.KOBOLD_CPP_BASE_PATH,
      apiKey: null,
    });
    const models = await openai.models
      .list()
      .then((results) => results.data)
      .catch((e) => {
        console.error(`KoboldCPP:listModels`, e.message);
        return [];
      });

    return { models, error: null };
  } catch (e) {
    console.error(`KoboldCPP:getKoboldCPPModels`, e.message);
    return { models: [], error: "Could not fetch KoboldCPP Models" };
  }
}

async function ollamaAIModels(basePath = null, _authToken = null) {
  let url;
  try {
    let urlPath = basePath ?? process.env.OLLAMA_BASE_PATH;
    new URL(urlPath);
    if (urlPath.split("").slice(-1)?.[0] === "/")
      throw new Error("BasePath Cannot end in /!");
    url = urlPath;
  } catch {
    return { models: [], error: "Not a valid URL." };
  }

  const authToken = _authToken || process.env.OLLAMA_AUTH_TOKEN || null;
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const models = await fetch(`${url}/api/tags`, { headers: headers })
    .then((res) => {
      if (!res.ok)
        throw new Error(`Could not reach Ollama server! ${res.status}`);
      return res.json();
    })
    .then((data) => data?.models || [])
    .then((models) =>
      models.map((model) => {
        return { id: model.name };
      })
    )
    .catch((e) => {
      console.error(e);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!authToken)
    process.env.OLLAMA_AUTH_TOKEN = authToken;
  return { models, error: null };
}

async function getTogetherAiModels(apiKey = null) {
  const _apiKey =
    apiKey === true
      ? process.env.TOGETHER_AI_API_KEY
      : apiKey || process.env.TOGETHER_AI_API_KEY || null;
  try {
    const { togetherAiModels } = require("../AiProviders/togetherAi");
    const models = await togetherAiModels(_apiKey);
    if (models.length > 0 && !!_apiKey)
      process.env.TOGETHER_AI_API_KEY = _apiKey;
    return { models, error: null };
  } catch (error) {
    console.error("Error in getTogetherAiModels:", error);
    return { models: [], error: "Failed to fetch Together AI models" };
  }
}

async function getFireworksAiModels() {
  const knownModels = fireworksAiModels();
  if (!Object.keys(knownModels).length === 0)
    return { models: [], error: null };

  const models = Object.values(knownModels).map((model) => {
    return {
      id: model.id,
      organization: model.organization,
      name: model.name,
    };
  });
  return { models, error: null };
}

async function getPerplexityModels() {
  const knownModels = perplexityModels();
  if (!Object.keys(knownModels).length === 0)
    return { models: [], error: null };

  const models = Object.values(knownModels).map((model) => {
    return {
      id: model.id,
      name: model.name,
    };
  });
  return { models, error: null };
}

async function getOpenRouterModels() {
  const knownModels = await fetchOpenRouterModels();
  if (!Object.keys(knownModels).length === 0)
    return { models: [], error: null };

  const models = Object.values(knownModels).map((model) => {
    return {
      id: model.id,
      organization: model.organization,
      name: model.name,
    };
  });
  return { models, error: null };
}

async function getNovitaModels() {
  const knownModels = await fetchNovitaModels();
  if (!Object.keys(knownModels).length === 0)
    return { models: [], error: null };
  const models = Object.values(knownModels).map((model) => {
    return {
      id: model.id,
      organization: model.organization,
      name: model.name,
    };
  });
  return { models, error: null };
}

async function getAPIPieModels(apiKey = null) {
  const knownModels = await fetchApiPieModels(apiKey);
  if (!Object.keys(knownModels).length === 0)
    return { models: [], error: null };

  const models = Object.values(knownModels)
    .filter((model) => {
      // Filter for chat models
      return (
        model.subtype &&
        (model.subtype.includes("chat") || model.subtype.includes("chatx"))
      );
    })
    .map((model) => {
      return {
        id: model.id,
        organization: model.organization,
        name: model.name,
      };
    });
  return { models, error: null };
}

async function getMistralModels(apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    apiKey: apiKey || process.env.MISTRAL_API_KEY || null,
    baseURL: "https://api.mistral.ai/v1",
  });
  const models = await openai.models
    .list()
    .then((results) =>
      results.data.filter((model) => !model.id.includes("embed"))
    )
    .catch((e) => {
      console.error(`Mistral:listModels`, e.message);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.MISTRAL_API_KEY = apiKey;
  return { models, error: null };
}

async function getElevenLabsModels(apiKey = null) {
  const models = (await ElevenLabsTTS.voices(apiKey)).map((model) => {
    return {
      id: model.voice_id,
      organization: model.category,
      name: model.name,
    };
  });

  if (models.length === 0) {
    return {
      models: [
        {
          id: "21m00Tcm4TlvDq8ikWAM",
          organization: "premade",
          name: "Rachel (default)",
        },
      ],
      error: null,
    };
  }

  if (models.length > 0 && !!apiKey) process.env.TTS_ELEVEN_LABS_KEY = apiKey;
  return { models, error: null };
}

async function getDeepSeekModels(apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    apiKey: apiKey || process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
  const models = await openai.models
    .list()
    .then((results) => results.data)
    .then((models) =>
      models.map((model) => ({
        id: model.id,
        name: model.id,
        organization: model.owned_by,
      }))
    )
    .catch((e) => {
      console.error(`DeepSeek:listModels`, e.message);
      return [
        {
          id: "deepseek-chat",
          name: "deepseek-chat",
          organization: "deepseek",
        },
        {
          id: "deepseek-reasoner",
          name: "deepseek-reasoner",
          organization: "deepseek",
        },
      ];
    });

  if (models.length > 0 && !!apiKey) process.env.DEEPSEEK_API_KEY = apiKey;
  return { models, error: null };
}

async function getXAIModels(_apiKey = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  const apiKey =
    _apiKey === true
      ? process.env.XAI_LLM_API_KEY
      : _apiKey || process.env.XAI_LLM_API_KEY || null;
  const openai = new OpenAIApi({
    baseURL: "https://api.x.ai/v1",
    apiKey,
  });
  const models = await openai.models
    .list()
    .then((results) => results.data)
    .catch((e) => {
      console.error(`XAI:listModels`, e.message);
      return [
        {
          created: 1725148800,
          id: "grok-beta",
          object: "model",
          owned_by: "xai",
        },
      ];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.XAI_LLM_API_KEY = apiKey;
  return { models, error: null };
}

async function getNvidiaNimModels(basePath = null) {
  try {
    const { OpenAI: OpenAIApi } = require("openai");
    const openai = new OpenAIApi({
      baseURL: parseNvidiaNimBasePath(
        basePath ?? process.env.NVIDIA_NIM_LLM_BASE_PATH
      ),
      apiKey: null,
    });
    const modelResponse = await openai.models
      .list()
      .then((results) => results.data)
      .catch((e) => {
        throw new Error(e.message);
      });

    const models = modelResponse.map((model) => {
      return {
        id: model.id,
        name: model.id,
        organization: model.owned_by,
      };
    });

    return { models, error: null };
  } catch (e) {
    console.error(`NVIDIA NIM:getNvidiaNimModels`, e.message);
    return { models: [], error: "Could not fetch NVIDIA NIM Models" };
  }
}

async function getGeminiModels(_apiKey = null) {
  const apiKey =
    _apiKey === true
      ? process.env.GEMINI_API_KEY
      : _apiKey || process.env.GEMINI_API_KEY || null;
  const models = await GeminiLLM.fetchModels(apiKey);
  // Api Key was successful so lets save it for future uses
  if (models.length > 0 && !!apiKey) process.env.GEMINI_API_KEY = apiKey;
  return { models, error: null };
}

async function getPPIOModels() {
  const ppioModels = await fetchPPIOModels();
  if (!Object.keys(ppioModels).length === 0) return { models: [], error: null };
  const models = Object.values(ppioModels).map((model) => {
    return {
      id: model.id,
      organization: model.organization,
      name: model.name,
    };
  });
  return { models, error: null };
}

async function getDellProAiStudioModels(basePath = null) {
  const { OpenAI: OpenAIApi } = require("openai");
  try {
    const { origin } = new URL(
      basePath || process.env.DELL_PRO_AI_STUDIO_BASE_PATH
    );
    const openai = new OpenAIApi({
      baseURL: `${origin}/v1/openai`,
      apiKey: null,
    });
    const models = await openai.models
      .list()
      .then((results) => results.data)
      .then((models) => {
        return models
          .filter((model) => model.capability === "TextToText") // Only include text-to-text models for this handler
          .map((model) => {
            return {
              id: model.id,
              name: model.name,
              organization: model.owned_by,
            };
          });
      })
      .catch((e) => {
        throw new Error(e.message);
      });
    return { models, error: null };
  } catch (e) {
    console.error(`getDellProAiStudioModels`, e.message);
    return {
      models: [],
      error: "Could not reach Dell Pro Ai Studio from the provided base path",
    };
  }
}

function getNativeEmbedderModels() {
  const { NativeEmbedder } = require("../EmbeddingEngines/native");
  return { models: NativeEmbedder.availableModels(), error: null };
}

async function getMoonshotAiModels(_apiKey = null) {
  const apiKey =
    _apiKey === true
      ? process.env.MOONSHOT_AI_API_KEY
      : _apiKey || process.env.MOONSHOT_AI_API_KEY || null;

  const { OpenAI: OpenAIApi } = require("openai");
  const openai = new OpenAIApi({
    baseURL: "https://api.moonshot.ai/v1",
    apiKey,
  });
  const models = await openai.models
    .list()
    .then((results) => results.data)
    .catch((e) => {
      console.error(`MoonshotAi:listModels`, e.message);
      return [];
    });

  // Api Key was successful so lets save it for future uses
  if (models.length > 0) process.env.MOONSHOT_AI_API_KEY = apiKey;
  return { models, error: null };
}

module.exports = {
  getCustomModels,
  SUPPORT_CUSTOM_MODELS,
};
