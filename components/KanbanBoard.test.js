// components/KanbanBoard.test.js

import { render, fireEvent } from '@testing-library/react';
import KanbanBoard from './KanbanBoard'; // Your Kanban Board component

describe('KanbanBoard', () => {
  test('drags a lead to a new status', () => {
    render(<KanbanBoard />);

    const lead = screen.getByText('Lead 1');
    const targetColumn = screen.getByText('Contacted');

    fireEvent.dragStart(lead);
    fireEvent.dragEnter(targetColumn);
    fireEvent.drop(targetColumn);

    expect(lead.parentElement).toBe(targetColumn); // Check if lead moved
  });
});
