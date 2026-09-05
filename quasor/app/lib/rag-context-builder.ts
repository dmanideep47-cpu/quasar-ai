/**
 * RAG Context Builder for Cygnus
 * 
 * Builds RAG context by:
 * 1. Analyzing the user's CodeLab state
 * 2. Constructing a retrieval query
 * 3. Calling the RAG retrieval service
 * 4. Structuring the context for Cygnus
 */

export interface CodelabContext {
  language: string;
  topic?: string;
  difficulty?: string;
  problem?: string;
  code?: string;
  error?: string;
  testResults?: string;
  userQuestion?: string;
}

export interface RetrievedChunk {
  chunk_id: string;
  text: string;
  score: number;
  metadata: {
    language: string;
    category: string;
    topic: string;
    difficulty: string;
    source: string;
  };
}

export interface RagSearchResult {
  query: string;
  filters: Record<string, any>;
  results: RetrievedChunk[];
  count: number;
  error?: string;
}

export interface CygnusContext {
  codelabContext: CodelabContext;
  retrievedKnowledge: RetrievedChunk[];
  retrievalInfo: {
    query: string;
    filters: Record<string, any>;
    chunkCount: number;
  };
}

/**
 * Build a retrieval query from CodeLab context
 */
function buildRetrievalQuery(context: CodelabContext): string {
  const parts: string[] = [];

  // Add user question if available
  if (context.userQuestion) {
    parts.push(context.userQuestion);
  }

  // Add error information if available
  if (context.error) {
    parts.push(`Error: ${context.error}`);
  }

  // Add problem description if available
  if (context.problem) {
    parts.push(`Problem: ${context.problem.substring(0, 200)}`);
  }

  // Add code snippet if available (first 500 chars)
  if (context.code && context.code.trim()) {
    const codeSnippet = context.code.substring(0, 500);
    parts.push(`Code: ${codeSnippet}`);
  }

  // If no specific question, build a generic query from context
  if (parts.length === 0) {
    if (context.topic) {
      parts.push(`How do I work with ${context.topic}?`);
    } else {
      parts.push(`Help me with ${context.language} programming`);
    }
  }

  return parts.join(" ");
}

/**
 * Determine metadata filters for the RAG search
 */
function getSearchFilters(
  context: CodelabContext
): Record<string, string> {
  const filters: Record<string, string> = {};

  // Language is always set from CodeLab
  if (context.language) {
    filters.language = context.language;
  }

  // Topic helps narrow search
  if (context.topic) {
    filters.topic = context.topic;
  }

  // Difficulty helps find appropriate knowledge
  if (context.difficulty) {
    filters.difficulty = context.difficulty;
  }

  // Error patterns can hint at category
  if (context.error) {
    if (context.error.includes("Error") || context.error.includes("error")) {
      filters.category = "debugging";
    } else if (context.topic === "lists" || context.topic === "dictionaries") {
      filters.category = "data-structures";
    }
  }

  return filters;
}

/**
 * Format retrieved knowledge chunks for Cygnus
 */
function formatRetrievedKnowledge(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }

  const formattedChunks = chunks
    .map((chunk, index) => {
      const relevance = (
        ((1 - chunk.score) * 100).toFixed(0)
      );
      return `### Knowledge Source ${index + 1} (${chunk.metadata.topic}, ${relevance}% relevant)\n\n${chunk.text}`;
    })
    .join("\n\n---\n\n");

  return formattedChunks;
}

/**
 * Call the RAG retrieval service
 */
async function retrieveKnowledge(
  query: string,
  filters: Record<string, string>
): Promise<RetrievedChunk[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `http://localhost:${process.env.PORT || "3001"}`;
    const url = `${baseUrl}/api/rag/search`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        ...filters,
        limit: 3, // Use top 3 chunks for Cygnus context
      }),
    });

    if (!response.ok) {
      console.error("[RAG] Search failed:", response.statusText);
      return [];
    }

    const result: RagSearchResult = await response.json();

    if (result.error) {
      console.error("[RAG] Search error:", result.error);
      return [];
    }

    return result.results || [];
  } catch (error) {
    console.error(
      "[RAG] Retrieval error:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

/**
 * Build complete Cygnus context with RAG knowledge
 */
export async function buildCygnusContext(
  codelabContext: CodelabContext
): Promise<CygnusContext> {
  // Build retrieval query
  const query = buildRetrievalQuery(codelabContext);

  // Get search filters
  const filters = getSearchFilters(codelabContext);

  // Retrieve relevant knowledge
  const retrievedKnowledge = await retrieveKnowledge(query, filters);

  // Log retrieval info (development only)
  if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
    console.log("[RAG Context]", {
      query: query.substring(0, 100),
      filters,
      chunkCount: retrievedKnowledge.length,
      scores: retrievedKnowledge.map((k) => ({
        topic: k.metadata.topic,
        score: k.score,
      })),
    });
  }

  return {
    codelabContext,
    retrievedKnowledge,
    retrievalInfo: {
      query,
      filters,
      chunkCount: retrievedKnowledge.length,
    },
  };
}

/**
 * Format Cygnus context for the system prompt
 */
export function formatCygnusPrompt(context: CygnusContext): string {
  const sections: string[] = [];

  // CodeLab Context Section
  const codelabInfo = [];
  if (context.codelabContext.language) {
    codelabInfo.push(`Language: ${context.codelabContext.language}`);
  }
  if (context.codelabContext.topic) {
    codelabInfo.push(`Topic: ${context.codelabContext.topic}`);
  }
  if (context.codelabContext.difficulty) {
    codelabInfo.push(`Difficulty: ${context.codelabContext.difficulty}`);
  }
  if (context.codelabContext.error) {
    codelabInfo.push(`Error: ${context.codelabContext.error}`);
  }

  sections.push(
    `<CODELAB_CONTEXT>
${codelabInfo.join("\n")}
</CODELAB_CONTEXT>`
  );

  // Retrieved Knowledge Section
  if (context.retrievedKnowledge.length > 0) {
    const knowledgeText = formatRetrievedKnowledge(
      context.retrievedKnowledge
    );
    sections.push(
      `<RETRIEVED_KNOWLEDGE>
The following knowledge from the CodeLab knowledge base may be relevant to this question:

${knowledgeText}
</RETRIEVED_KNOWLEDGE>`
    );
  } else {
    sections.push(
      `<RETRIEVED_KNOWLEDGE>
No relevant knowledge chunks were found in the knowledge base. 
Use your general knowledge to help the user.
</RETRIEVED_KNOWLEDGE>`
    );
  }

  return sections.join("\n\n");
}

export default buildCygnusContext;
