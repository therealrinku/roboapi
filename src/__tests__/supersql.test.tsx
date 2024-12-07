import '@testing-library/jest-dom';
import {
  fireEvent,
  getByLabelText,
  render,
  screen,
} from '@testing-library/react';
import SuperSqlClient from '../renderer/pages/super-sql-client';

describe('SuperSqlClient', () => {
  it('should render', () => {
    expect(render(<SuperSqlClient />)).toBeTruthy();
  });

  it('should show connection string field when use connection string button is clicked', () => {
    render(<SuperSqlClient/>);
    const btn = screen.getByRole('toggleConnectionInput');
    fireEvent.click(btn);
    const connectionStringInput = screen.getAllByTitle('Connection String');
    expect(connectionStringInput).toBeTruthy();
  });
});
