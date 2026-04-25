function normalizeFilters(filters) {
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) {
    return {};
  }

  return filters;
}

function getComparableTime(value) {
  const parsedDate = value ? new Date(value) : null;
  const timestamp = parsedDate?.getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortByDateField(field, direction = 'desc') {
  return (items) =>
    [...items].sort((left, right) => {
      const difference = getComparableTime(left?.[field]) - getComparableTime(right?.[field]);
      return direction === 'asc' ? difference : -difference;
    });
}

export function upsertEntityInListQueries({
  queryClient,
  baseKey,
  entity,
  matchesFilters = () => true,
  sortItems,
}) {
  if (!entity?.id) {
    return;
  }

  const queries = queryClient.getQueriesData({ queryKey: [baseKey] });

  queries.forEach(([queryKey, existing]) => {
    if (!Array.isArray(existing)) {
      return;
    }

    const filters = normalizeFilters(queryKey[1]);
    const nextItemsWithoutEntity = existing.filter((item) => item?.id !== entity.id);

    if (!matchesFilters(entity, filters)) {
      if (nextItemsWithoutEntity.length !== existing.length) {
        queryClient.setQueryData(queryKey, nextItemsWithoutEntity);
      }

      return;
    }

    const nextItems = sortItems
      ? sortItems([entity, ...nextItemsWithoutEntity])
      : [entity, ...nextItemsWithoutEntity];

    queryClient.setQueryData(queryKey, nextItems);
  });
}

export function mergeEntityDetailQuery(queryClient, baseKey, entity) {
  if (!entity?.id) {
    return;
  }

  queryClient.setQueryData([baseKey, entity.id], (existing) => {
    if (!existing || typeof existing !== 'object') {
      return entity;
    }

    return {
      ...existing,
      ...entity,
    };
  });
}

export function removeEntityFromQueries({ queryClient, baseKey, entityId }) {
  if (!entityId) {
    return;
  }

  const queries = queryClient.getQueriesData({ queryKey: [baseKey] });

  queries.forEach(([queryKey, existing]) => {
    if (Array.isArray(existing)) {
      const nextItems = existing.filter((item) => item?.id !== entityId);

      if (nextItems.length !== existing.length) {
        queryClient.setQueryData(queryKey, nextItems);
      }

      return;
    }

    if (queryKey.length === 2 && queryKey[1] === entityId) {
      queryClient.removeQueries({ queryKey, exact: true });
    }
  });
}
