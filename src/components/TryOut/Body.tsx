import * as React from 'react';
import { toLower } from 'lodash';

import { RequestBodyModel } from '../../services';
import { JsonViewer } from '../JsonViewer/JsonViewer';
import { SchemaSection } from './SchemaSection';
import { Dropdown, SectionHeader } from './styled.elements';

interface BodyProps {
  specBody: RequestBodyModel | undefined;
  onChange: any;
  isFormData: boolean;
  error: string | undefined;
  requestPayload: any;
  setIsFormData: (any) => void;
  setError: (string) => void;
}

/**
 *
 * @param specBody Request body of current operation, matching the request model from spec
 * @param isFormData Indicates whether form data is selected (i.e. true) or the raw JSON (i.e. false)
 * @param onChange State callback to change requestBody (payload) param
 * @param setIsFormData State callback to handle data format change from dropdown
 * @param error State error
 * @param setError State callback to set encountered errors so that they can be handled in parent
 * @param requestPayload Actual request state body i.e. payload that will be sent
 */
export const Body = ({
  specBody,
  onChange,
  isFormData,
  error,
  setIsFormData,
  setError,
  requestPayload,
}: BodyProps) => {
  if (!specBody) return null;
  const contentType = toLower(specBody?.content?.active?.name);
  const FORM_DATA_CONTENT_TYPES = ['multipart/form-data', 'application/x-www-form-urlencoded'];
  const shouldEnableJsonOption = !FORM_DATA_CONTENT_TYPES.includes(contentType);

  return (
    <>
      <SectionHeader>
        <div>Body</div>
        <Dropdown
          width={'5rem'}
          borderColor={'#E0E0E0'}
          borderWidth={'2px'}
          borderRadius={'8px'}
          outline={'none'}
          cursor={'pointer'}
          onChange={({ target: { value } }) => setIsFormData(value === 'form-data')}
        >
          {shouldEnableJsonOption && <option value="raw-json">JSON</option>}
          <option value="form-data">Form</option>
        </Dropdown>
      </SectionHeader>
      <>
        {isFormData ? (
          <>
            <SchemaSection
              schema={specBody.content?.active?.schema}
              contentType={specBody.content?.active?.name}
              onChange={onChange}
              requestPayload={requestPayload}
            />
          </>
        ) : (
          <JsonViewer
            data={requestPayload || {}}
            editable
            setParsedJSON={onChange}
            error={error}
            setError={setError}
          />
        )}
      </>
    </>
  );
};
