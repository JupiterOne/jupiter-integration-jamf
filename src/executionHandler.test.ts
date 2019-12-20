/* eslint-disable @typescript-eslint/unbound-method */
import {
  IntegrationActionName,
  IntegrationExecutionContext,
  GraphClient,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import executionHandler from "./executionHandler";
import initializeContext from "./initializeContext";
import { JamfIntegrationContext } from "./types";
import { JamfClient } from "./jamf";

jest.mock("./initializeContext");

let executionContext: JamfIntegrationContext;

beforeEach(() => {
  executionContext = ({
    graph: ({
      findEntitiesByType: jest.fn().mockResolvedValue([]),
      findRelationshipsByType: jest.fn().mockResolvedValue([]),
    } as unknown) as GraphClient,
    persister: ({
      processEntities: jest.fn().mockReturnValue([]),
      processRelationships: jest.fn().mockReturnValue([]),
      publishPersisterOperations: jest.fn().mockResolvedValue({}),
    } as unknown) as PersisterClient,
    provider: ({
      fetchAccounts: jest.fn().mockReturnValue({ users: [], groups: [] }),
      fetchAccountUserById: jest.fn().mockReturnValue([]),
      fetchAccountGroupById: jest.fn().mockReturnValue([]),
      fetchUsers: jest.fn().mockReturnValue([]),
      fetchUserById: jest.fn().mockReturnValue({}),
      fetchMobileDevices: jest.fn().mockReturnValue([]),
      fetchComputers: jest.fn().mockReturnValue([]),
      fetchOSXConfigurationProfiles: jest.fn().mockReturnValue([]),
      fetchOSXConfigurationProfileById: jest.fn().mockReturnValue({}),
    } as unknown) as JamfClient,
    account: {
      id: "testId",
      name: "testName",
    },
  } as unknown) as JamfIntegrationContext;

  (initializeContext as jest.Mock).mockReturnValue(executionContext);
});

test("executionHandler with INGEST action", async () => {
  const invocationContext = {
    instance: {
      config: {},
    },
    event: {
      action: {
        name: IntegrationActionName.INGEST,
      },
    },
  } as IntegrationExecutionContext;

  await executionHandler(invocationContext);

  expect(initializeContext).toHaveBeenCalledWith(invocationContext);
  expect(executionContext.provider.fetchAccounts).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchAccountUserById).toHaveBeenCalledTimes(
    0,
  );
  expect(executionContext.provider.fetchAccountGroupById).toHaveBeenCalledTimes(
    0,
  );
  expect(executionContext.provider.fetchUsers).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchUserById).toHaveBeenCalledTimes(0);
  expect(executionContext.provider.fetchMobileDevices).toHaveBeenCalledTimes(1);
  expect(executionContext.provider.fetchComputers).toHaveBeenCalledTimes(1);
  expect(
    executionContext.provider.fetchOSXConfigurationProfiles,
  ).toHaveBeenCalledTimes(1);
  expect(
    executionContext.provider.fetchOSXConfigurationProfileById,
  ).toHaveBeenCalledTimes(0);
  // +1 due to deleting deprecated entities
  expect(executionContext.persister.processEntities).toHaveBeenCalledTimes(
    7 + 1,
  );
  expect(
    executionContext.persister.publishPersisterOperations,
  ).toHaveBeenCalledTimes(1 + 1);
});

test("executionHandler with unhandled action", async () => {
  const invocationContext = {
    instance: {
      config: {},
    },
    event: {
      action: {
        name: IntegrationActionName.SCAN,
      },
    },
  } as IntegrationExecutionContext;

  await executionHandler(invocationContext);

  expect(executionContext.provider.fetchUsers).not.toHaveBeenCalled();
  expect(executionContext.provider.fetchMobileDevices).not.toHaveBeenCalled();
  expect(executionContext.provider.fetchUserById).not.toHaveBeenCalled();
  expect(executionContext.persister.processEntities).not.toHaveBeenCalled();
  expect(
    executionContext.persister.publishPersisterOperations,
  ).not.toHaveBeenCalled();
  expect(
    executionContext.persister.publishPersisterOperations,
  ).not.toHaveBeenCalled();
});
