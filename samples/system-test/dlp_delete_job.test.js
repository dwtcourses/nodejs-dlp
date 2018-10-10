/**
 * Copyright 2019, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {assert} = require('chai');
const dlp = require('@google-cloud/dlp');
const execa = require('execa');
const exec = async cmd => (await execa.shell(cmd)).stdout;

const REGION_TAG = 'dlp_delete_job';

describe(REGION_TAG, () => {
  let projectId;
  let dlpJob;

  before(async () => {
    const client = new dlp.DlpServiceClient();
    projectId = await client.getProjectId();

    const request = {
      parent: dlp.projectPath(projectId),
      riskJob: {
        privacyMetric: {
          categoricalStatsConfig: {
            field: {
              name: 'zip_code',
            },
          },
        },
        sourceTable: {
          projectId: 'bigquery-public-data',
          datasetId: 'san_francisco',
          tableId: 'bikeshare_trips',
        },
      },
    };

    const [response] = await dlp.createDlpJob(request);
    dlpJob = client.matchDlpJobFromDlpJobName(response.name);
  });

  it('should delete job', async () => {
    const output = await exec(`node ${REGION_TAG}.js ${projectId} ${dlpJob}`);
    assert.strictEqual(output, `Successfully deleted job ${dlpJob}`);
  });
});
