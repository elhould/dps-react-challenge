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
	const [highlightOldestUserPerCity, setHighlightOldestPerCity] =
		useState<boolean>(false);

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

	const oldestUsersPerCity = users.reduce<{ [key: string]: User[] }>(
		(acc, user) => {
			const city = user.address.city;
			if (!acc[city]) {
				acc[city] = [user];
			} else {
				const existingOldestUser = acc[city][0];
				const userBirthDate = new Date(user.birthDate).getTime();
				const existingBirthDate = new Date(
					existingOldestUser.birthDate
				).getTime();

				if (userBirthDate < existingBirthDate) {
					acc[city] = [user];
				} else if (userBirthDate === existingBirthDate) {
					acc[city].push(user);
				}
			}
			return acc;
		},
		{}
	);

	return (
		<>
			<div>
				<a href="https://www.digitalproductschool.io/" target="_blank">
					<img src={dpsLogo} className="logo" alt="DPS logo" />
				</a>
			</div>
			<div
				style={{
					border: '2px solid black',
					borderRadius: '16px',
					padding: '1rem',
				}}
			>
				<div
					style={{
						marginBottom: '1rem',
						display: 'flex',
						gap: '1rem',
					}}
				>
					{/* Filter by name */}
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
								border: '2px solid black',
							}}
						/>
					</div>

					{/* Filter by city */}
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
								border: '2px solid black',
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

					{/* Highlight oldest users per city */}
					<div
						style={{
							flex: 1,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<label
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								width: '100%',
								gap: '0.5rem',
								fontSize: '1rem',
								textAlign: 'left',
								marginTop: '1rem',
							}}
						>
							Highlight oldest per city
							<input
								style={{
									width: '50%',
									transform: 'scale(1.5)',
								}}
								type="checkbox"
								checked={highlightOldestUserPerCity}
								onChange={(e) =>
									setHighlightOldestPerCity(e.target.checked)
								}
							/>
						</label>
					</div>
				</div>
				<div
					style={{
						border: '2px solid black',
						borderRadius: '16px',
						overflow: 'hidden',
					}}
				>
					<table
						style={{
							width: '100%',
							borderCollapse: 'collapse',
						}}
					>
						<thead>
							<tr
								style={{
									borderBottom: '2px solid black',
								}}
							>
								<th
									style={{
										fontWeight: 'normal',
										padding: '10px',
										textAlign: 'left',
									}}
								>
									Name
								</th>
								<th
									style={{
										fontWeight: 'normal',
										padding: '10px',
										textAlign: 'left',
									}}
								>
									City
								</th>
								<th
									style={{
										fontWeight: 'normal',
										padding: '10px',
										textAlign: 'left',
									}}
								>
									Birthday
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredUsers.map((user) => {
								const isOldest =
									highlightOldestUserPerCity &&
									oldestUsersPerCity[user.address.city]?.some(
										(u) => u.id === user.id
									);

								return (
									<tr
										key={user.id}
										style={{
											backgroundColor: isOldest
												? '#add8e6'
												: 'transparent',
											borderRadius: '5px',
										}}
									>
										<td
											style={{
												padding: '10px',
												textAlign: 'left',
											}}
										>
											{user.firstName +
												' ' +
												user.lastName}
										</td>
										<td
											style={{
												padding: '10px',
												textAlign: 'left',
											}}
										>
											{user.address.city}
										</td>
										<td
											style={{
												padding: '10px',
												textAlign: 'left',
											}}
										>
											{formatDate(user.birthDate)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
}

export default App;
