import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import Badge from '../ui/badge/Badge';

interface Attendee {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  ticket_type: {
    name: string;
  };
  status: string;
  unique_code: string;
  purchase_date: string;
}

interface AttendeesTableProps {
  attendees: Attendee[];
}

const AttendeesTable: React.FC<AttendeesTableProps> = ({ attendees }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee =>
      `${attendee.user.first_name} ${attendee.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.unique_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendees, searchTerm]);

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Tipo de Boleta', 'Estado Boleta', 'Código', 'Fecha de Compra'];
    const rows = filteredAttendees.map(attendee => [
      `${attendee.user.first_name} ${attendee.user.last_name}`,
      attendee.user.email,
      attendee.ticket_type.name,
      attendee.status,
      attendee.unique_code,
      new Date(attendee.purchase_date).toLocaleDateString(),
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "asistentes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, email o código..."
          className="w-1/3 px-4 py-2 border rounded-md"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={exportToCSV}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Exportar a CSV
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader>Nombre</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Tipo de Boleta</TableCell>
                <TableCell isHeader>Estado Boleta</TableCell>
                <TableCell isHeader>Código</TableCell>
                <TableCell isHeader>Fecha de Compra</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredAttendees.map((attendee) => (
                <TableRow key={attendee.id}>
                  <TableCell>{`${attendee.user.first_name} ${attendee.user.last_name}`}</TableCell>
                  <TableCell>{attendee.user.email}</TableCell>
                  <TableCell>{attendee.ticket_type.name}</TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={
                        attendee.status === 'Comprada' ? 'success' :
                        attendee.status === 'Usada' ? 'warning' : 'default'
                      }
                    >
                      {attendee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{attendee.unique_code}</TableCell>
                  <TableCell>{new Date(attendee.purchase_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AttendeesTable;
