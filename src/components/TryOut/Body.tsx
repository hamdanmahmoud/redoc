import * as React from 'react';

import { RequestBodyModel } from '../../services';
import { JsonViewer } from '../JsonViewer/JsonViewer';
import { SchemaSection } from './SchemaSection';
import { Dropdown, SectionHeader } from './styled.elements';

interface BodyProps {
  specBody: RequestBodyModel | undefined;
  onChange: any;
  isFormData: boolean;
  error: string | undefined;
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
 */
export const Body = ({
  specBody,
  onChange,
  isFormData,
  error,
  setIsFormData,
  setError,
}: BodyProps) => {
  if (!specBody) return null;

  return (
    <>
      <SectionHeader>
        <div>Body</div>
        <Dropdown
          width={'5rem'}
          borderStyle={'none'}
          outline={'none'}
          cursor={'pointer'}
          onChange={({ target: { value } }) => setIsFormData(value === 'form-data')}
        >
          <option value="form-data">Form</option>
          <option value="raw-json">JSON</option>
        </Dropdown>
      </SectionHeader>
      <>
        {isFormData ? (
          <>
            <SchemaSection
              schema={specBody.content?.active?.schema}
              contentType={specBody.content?.active?.name}
              onChange={onChange}
            />
          </>
        ) : (
          <JsonViewer
            data={{}}
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
