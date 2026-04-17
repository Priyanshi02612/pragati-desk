import { useMemo, useState } from 'react';
import { useAppContext } from '../app/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { Modal } from '../components/ui/Modal';
import { Table } from '../components/ui/Table';
import { formatPercent } from '../utils/format';

export const AdminEmployeesPage = () => {
  const { createEmployee, users } = useAppContext();
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: '',
  });

  const employees = useMemo(
    () => users.filter((user) => user.role === 'Employee'),
    [users],
  );

  const employeeColumns = [
    { key: 'name', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'email', label: 'Email' },
    {
      key: 'performance',
      label: 'Performance',
      render: (row) => (
        <span className={row.performance < 85 ? 'font-semibold text-brand-danger' : ''}>
          {formatPercent(row.performance)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Employees</h2>
            <p className="section-copy">
              Keep employee records separate from ticket management for a cleaner admin workflow.
            </p>
          </div>
          <Button onClick={() => setEmployeeModalOpen(true)}>Create employee</Button>
        </div>
        <Table columns={employeeColumns} rows={employees} />
      </Card>

      <Modal
        title="Create Employee"
        description="Add a new employee profile with a role and department assignment."
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createEmployee(employeeForm);
            setEmployeeForm({ name: '', email: '', role: 'Employee', department: '' });
            setEmployeeModalOpen(false);
          }}
        >
          <InputField
            label="Full name"
            value={employeeForm.name}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <InputField
            label="Email"
            value={employeeForm.email}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <InputField
            label="Role"
            as="select"
            value={employeeForm.role}
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'Team Leader', label: 'Team Leader' },
              { value: 'Admin', label: 'Admin' },
            ]}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, role: event.target.value }))
            }
          />
          <InputField
            label="Department"
            value={employeeForm.department}
            onChange={(event) =>
              setEmployeeForm((current) => ({ ...current, department: event.target.value }))
            }
          />
          <div className="flex justify-end gap-3">
            <Button variant="muted" onClick={() => setEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !employeeForm.name.trim() ||
                !employeeForm.email.trim() ||
                !employeeForm.department.trim()
              }
              className="disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
