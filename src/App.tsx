import dpsLogo from './assets/DPS.svg';
import './App.css';
import { useEffect, useState } from 'react';

interface User {
	id: number;
	firstName: string;
	lastName: string;
	address: {
		city: string;
	};
	birthDate: string;
}

function App() {
	const [users, setUsers] = useState<User[]>([]);
	const [nameFilter, setNameFilter] = useState<string>('');

	useEffect(() => {
		fetch('https://dummyjson.com/users')
			.then((response) => response.json())
			.then((data) => setUsers(data.users))
			.catch((error) =>
				console.error('An error occured while fetching users: ', error)
			);
	}, []);

	function formatDate(dateAsString: string): string {
		const date = new Date(dateAsString);
		return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
	}

	const filteredUsers = users.filter((user) =>
		`${user.firstName} ${user.lastName}`
			.toLowerCase()
			.includes(nameFilter.toLowerCase())
	);

	return (
		<>
			<div>
				<a href="https://www.digitalproductschool.io/" target="_blank">
					<img src={dpsLogo} className="logo" alt="DPS logo" />
				</a>
			</div>
			<div>
				<div
					style={{
						marginBottom: '1rem',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div
						style={{
							fontSize: '1rem',
							textAlign: 'left',
						}}
					>
						Name
					</div>
					<input
						type="text"
						placeholder="Filter by name..."
						value={nameFilter}
						onChange={(e) => setNameFilter(e.target.value)}
						style={{
							width: '100%',
							border: '1px solid black',
						}}
					/>
				</div>
				<table
					border={1}
					style={{ width: '100%', borderCollapse: 'collapse' }}
				>
					<thead>
						<tr>
							<th>Name</th>
							<th>City</th>
							<th>Birthday</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map((user) => (
							<tr key={user.id}>
								<td>{user.firstName + ' ' + user.lastName}</td>
								<td>{user.address.city}</td>
								<td>{formatDate(user.birthDate)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

export default App;
