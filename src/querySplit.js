function detectSemicolons(query) {
  let isSingleComment = false;
  let multiLineCommentDepth = 0;
  let currentQuotes = null;
  let firstDollarPos = null;

  // 'on top' means not in any quotes or comments
  function isOnTop() {
    return (
      isSingleComment === false &&
      multiLineCommentDepth === 0 &&
      currentQuotes === null
    );
  }
  
  function isNotInComment() {
    return (
      isSingleComment === false &&
      multiLineCommentDepth === 0
    );
  }
  
  let semicolonPositions = [];
  for (let i = 0; i < query.length; i++) {
    if (query[i] === ';' && isOnTop()) {
      semicolonPositions.push(i);
    }

    if (query.substr(i, 2) === '--' && isOnTop()) {
      isSingleComment = true;
    }

    if (query[i] === '\n' && isSingleComment) {
      isSingleComment = false;
    }

    if (
      query.substr(i, 2) === '/*' &&
      currentQuotes === null &&
      !isSingleComment
    ) {
      multiLineCommentDepth++;
    }

    if (
      query.substr(i, 2) === '*/' &&
      currentQuotes === null &&
      !isSingleComment
    ) {
      multiLineCommentDepth--;
    }

    if (['\'', '"'].indexOf(query[i]) !== -1 && isOnTop()) {
      currentQuotes = query[i];
      continue;
    }

    if (query[i] === '$') {
      if (
        isOnTop() &&
        firstDollarPos === null &&
        query[i + 1].match(/[^0-9]/)
      ) {
        firstDollarPos = i;
      } else if (firstDollarPos !== null) {
        currentQuotes = query.substr(firstDollarPos, i - firstDollarPos + 1);
      }
    }
    
    if (
      currentQuotes !== null &&
      currentQuotes === query.substr(i, currentQuotes.length) &&
      isNotInComment()
    ) {
      currentQuotes = null;
    }
  }
  
  return semicolonPositions;
}

function queryNotIsComment(query) {
  let single =   query.match(/^\-\-.*$/);
  let multiple = query.match(/^\/\*[\s\S]*\*\/\;*$/);
  
  return !(Boolean(single) || Boolean(multiple));
}

function splitQueryByPositions(semicolonPositions, query) {
  if (semicolonPositions.length < 1) {
    return [query];
  }
  
  let offset = 0;
  let queries = [];
  semicolonPositions.forEach((position) => {
    queries.push(query.substr(offset, ++position - offset));
    offset = position;
  });
  
  queries.push(query.substr(offset));
    
  return queries
    .map((query) => query.trim())
    .filter((query) => query !== '' && query !== ';')
    .filter(queryNotIsComment);
}

export default function querySplit(query) {
  let semicolonPositions = detectSemicolons(query);
  
  return splitQueryByPositions(semicolonPositions, query);
}
