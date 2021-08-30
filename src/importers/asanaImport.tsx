import React from "react";
import asanaClient from "./asana";
import { convertOptions } from "./utils";
import { MAX_RESULTS } from "./config";

const importer = aha.getImporter<ITask>("aha-develop.asana-import.asanaImport");

async function authenticate(useCache = true) {
  const authData = await aha.auth("asana", { useCachedRetry: true });
  asanaClient.setToken(authData.token);
}

/**
 * Returns Filter List
 */
importer.on({ action: "listFilters" }, async (): Promise<Aha.ListFilters> => {
  await authenticate();
  return {
    workspace: {
      title: "WorkSpace",
      required: true,
      type: "select",
    },
    project: {
      title: "Project",
      required: true,
      type: "select",
    },
  };
});

/**
 * Returns Filter Values
 */
importer.on({ action: "filterValues" }, async ({ filterName, filters }): Promise<Aha.FilterValue[]> => {
  await authenticate();
  switch (filterName) {
    case "workspace": {
      const workspaces = await asanaClient.getWorkSpaces();
      return workspaces.map(convertOptions);
    }
    case "project": {
      const activeWorkSpace = filters.workspace;
      const projects = await asanaClient.getProjects({ workspace: activeWorkSpace });
      return projects.map(convertOptions);
    }
  }

  return [];
});

/**
 * Returns Task list for importing
 */
importer.on({ action: "listCandidates" }, async ({ filters, nextPage }) => {
  await authenticate();
  const filterOptions: IGetTaskOptions = {
    project: filters.project,
    limit: MAX_RESULTS,
    ...(nextPage ? { offset: nextPage } : {}),
    ...(filters.assignee ? { assignee: filters.assignee } : {}),
  };

  const { data: tasks, next_page } = await asanaClient.getTasks(filterOptions);
  return {
    records: tasks.map(({ gid, name, ...rest }) => ({
      uniqueId: gid,
      name: name,
      ...rest,
    })),
    nextPage: next_page,
  };
});

/**
 * Renders Import Record
 */
importer.on({ action: "renderRecord" }, async ({ record, onUnmounted }) => {
  await authenticate();
  return (
    <div>
      <h6>{(record?.memberships || [])[0]?.section?.name || ""}</h6>
      <a href={`${record.permalink_url}`}>{record.name}</a>
    </div>
  );
});

/**
 * Imports Record
 */
importer.on({ action: "importRecord" }, async ({ importRecord, ahaRecord }) => {
  await authenticate();
  ahaRecord.description =
    `${importRecord.notes}<p><a href='${importRecord.permalink_url}'>View on Asana</a></p>` as any;
  await ahaRecord.save();
});
