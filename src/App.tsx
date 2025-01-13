import dpsLogo from './assets/DPS.svg';
import './App.css';
import { useEffect, useState } from 'react';

// Define the User interface
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
	// Define the state variables
	const [users, setUsers] = useState<User[]>([]);
	const [nameFilter, setNameFilter] = useState<string>('');
	const [cityFilter, setCityFilter] = useState<string>('');

	// Fetch users from the API and set them in the state
	useEffect(() => {
		fetch('https://dummyjson.com/users')
			.then((response) => response.json())
			.then((data) => setUsers(data.users))
			.catch((error) =>
				console.error('An error occured while fetching users: ', error)
			);
	}, []);

	// Takes a date in string format and turns it into a date with the format dd.mm.yyyy
	function formatDate(dateAsString: string): string {
		const date = new Date(dateAsString);
		return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
	}

	// Get all city names from the users and sort them alphabetically
	const sortedCityNames = Array.from(
		new Set(users.map((user) => user.address.city))
	).sort();

	// Filter users by name and city
	const filteredUsers = users.filter(
		(user) =>
			`${user.firstName} ${user.lastName}`
				.toLowerCase()
				.includes(nameFilter.toLowerCase()) &&
			(cityFilter === '' || user.address.city === cityFilter)
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
						gap: '1rem',
					}}
				>
					{/* Filter by Name */}
					<div style={{ flex: 1 }}>
						<div
							style={{
								fontSize: '1rem',
								textAlign: 'left',
							}}
						>
							Name
						</div>

						{/* Input field to filter users by name */}
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

					{/* Filter by City */}
					<div style={{ flex: 1 }}>
						<div
							style={{
								fontSize: '1rem',
								textAlign: 'left',
							}}
						>
							City
						</div>
						{/* Dropdown for filtering users by city */}
						<select
							value={cityFilter}
							onChange={(e) => setCityFilter(e.target.value)}
							style={{
								width: '100%',
								border: '1px solid black',
							}}
						>
							{/* The "Select City" option here is supposed to simulate a placeholder, because select doesn't offer placeholders */}
							<option value="" disabled hidden>
								Select City
							</option>
							<option value="">All Cities</option>
							{sortedCityNames.map((city) => (
								<option key={city} value={city}>
									{city}
								</option>
							))}
						</select>
					</div>
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
