// src/stories/Swagger.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { DefaultsChip } from './components/DefaultsChip';

type SwaggerArgs = {
  docExpansion: 'list' | 'full' | 'none';
  defaultModelsExpandDepth: number;
  defaultModelExpandDepth: number;
  defaultModelRendering: 'example' | 'model';
  filter: boolean;
  displayOperationId: boolean;
  persistAuthorization: boolean;
  tryItOut: boolean;
};

function SwaggerDoc(args: SwaggerArgs) {
  const supportedSubmitMethods = args.tryItOut ? undefined : [];
  return (
    <div style={{ height: '90vh' }}>
      <div style={{ padding: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <DefaultsChip />
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          docExpansion={args.docExpansion}, defaultModelsExpandDepth={args.defaultModelsExpandDepth}
          , defaultModelExpandDepth={args.defaultModelExpandDepth}
        </div>
      </div>
      <SwaggerUI
        url="/docs/api-specs/openapi/quizmentor-api-v1.yaml"
        docExpansion={args.docExpansion}
        defaultModelsExpandDepth={args.defaultModelsExpandDepth}
        defaultModelExpandDepth={args.defaultModelExpandDepth}
        defaultModelRendering={args.defaultModelRendering}
        filter={args.filter}
        displayOperationId={args.displayOperationId}
        persistAuthorization={args.persistAuthorization}
        supportedSubmitMethods={supportedSubmitMethods as any}
      />
    </div>
  );
}

const meta = {
  title: 'API/Swagger',
  component: SwaggerDoc,
  parameters: {
    layout: 'fullscreen',
    helpDocs: [
      {
        href: '?path=/story/specs-service-catalog--page#express-api',
        title: 'Service Catalog — Express API',
      },
      {
        href: '?path=/story/overview-architecture--page#system-map',
        title: 'Architecture — System Map',
      },
      {
        href: '?path=/story/labs-technology-overview-lab--page',
        title: 'Technology Overview Lab',
      },
    ],
    docs: {
      description: {
        component:
          'Swagger UI rendering of the API spec. The spec lives at docs/api-specs/openapi/quizmentor-api-v1.yaml and is served via Storybook staticDirs. See also: Overview/Architecture ( ?path=/story/overview-architecture--page ).',
      },
    },
  },
  argTypes: {
    docExpansion: { control: { type: 'select' }, options: ['list', 'full', 'none'] },
    defaultModelsExpandDepth: { control: { type: 'number', min: -1, max: 5 } },
    defaultModelExpandDepth: { control: { type: 'number', min: -1, max: 5 } },
    defaultModelRendering: { control: { type: 'radio' }, options: ['example', 'model'] },
    filter: { control: 'boolean' },
    displayOperationId: { control: 'boolean' },
    persistAuthorization: { control: 'boolean' },
    tryItOut: { control: 'boolean' },
  },
  args: {
    docExpansion: 'list',
    defaultModelsExpandDepth: 0,
    defaultModelExpandDepth: 1,
    defaultModelRendering: 'example',
    filter: false,
    displayOperationId: false,
    persistAuthorization: false,
    tryItOut: true,
  },
} satisfies Meta<typeof SwaggerDoc>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const NoTryOut: StoryObj<typeof meta> = {
  parameters: { docs: { description: { story: 'TryItOut disabled; operations are view-only.' } } },
  args: { tryItOut: false },
};

export const FullExpansion: StoryObj<typeof meta> = {
  parameters: {
    docs: { description: { story: 'Fully expanded docs and models for quick scanning.' } },
  },
  args: { docExpansion: 'full', defaultModelsExpandDepth: 1, defaultModelExpandDepth: 2 },
};
