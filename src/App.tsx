import dpsLogo from './assets/DPS.svg';
import './App.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';

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
	const [debouncedNameFilter, setDebouncedNameFilter] = useState<string>('');
	const [cityFilter, setCityFilter] = useState<string>('');
	const [highlightOldestUserPerCity, setHighlightOldestPerCity] =
		useState<boolean>(false);

	const debounceTimeout = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		fetch('https://dummyjson.com/users')
			.then((response) => response.json())
			.then((data) => setUsers(data.users))
			.catch((error) =>
				console.error('An error occured while fetching users: ', error)
			);
	}, []);

	// Debounce the name filter input to reduce the frequency of filtering logic execution
	// and improve performance when the user types.

	useEffect(() => {
		debounceTimeout.current = setTimeout(() => {
			setDebouncedNameFilter(nameFilter);
		}, 1000);

		return () => clearTimeout(debounceTimeout.current);
	}, [nameFilter]);

	// Takes a date in string format and turns it into a date with the format dd.mm.yyyy
	function formatDate(dateAsString: string): string {
		const date = new Date(dateAsString);
		return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
	}

	// Get all city names from the users and sort them alphabetically
	const sortedCities = Array.from(
		new Set(users.map((user) => user.address.city))
	).sort();

	const cityOptions = sortedCities.map((city) => ({
		value: city.toLowerCase(), // Use lowercase for the value
		label: city, // Display the city name as it is
	}));

	// Filter users by name and city with useMemo for improved performance
	const filteredUsers = useMemo(() => {
		const lowerCaseNameFilter = debouncedNameFilter.toLowerCase();
		const lowerCaseCityFilter = cityFilter.toLowerCase();

		return users.filter((user) => {
			const userFullName =
				`${user.firstName} ${user.lastName}`.toLowerCase();
			const userCity = user.address.city.toLowerCase();
			const matchesName = userFullName.includes(lowerCaseNameFilter);
			const matchesCity =
				cityFilter === '' || userCity === lowerCaseCityFilter;

			return matchesName && matchesCity;
		});
	}, [users, debouncedNameFilter, cityFilter]);

	// Find the oldest user per city with useMemo for improved performance
	const oldestUsersPerCity = useMemo(() => {
		return users.reduce<{ [key: string]: User[] }>((acc, user) => {
			const city = user.address.city;
			const userBirthDate = new Date(user.birthDate).getTime();
			if (
				!acc[city] ||
				userBirthDate < new Date(acc[city][0].birthDate).getTime()
			) {
				acc[city] = [user];
			} else if (
				userBirthDate === new Date(acc[city][0].birthDate).getTime()
			) {
				acc[city].push(user);
			}
			return acc;
		}, {});
	}, [users]);

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
								borderRadius: '16px',
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
						<Select
							options={cityOptions}
							placeholder="Select City..."
							isClearable
							value={cityOptions.find(
								(option) => option.value === cityFilter
							)}
							onChange={(selectedOption) =>
								setCityFilter(
									selectedOption ? selectedOption.value : ''
								)
							}
							styles={{
								container: (provided) => ({
									...provided,
									width: '100%',
								}),
								control: (provided) => ({
									...provided,
									height: '50px',
									border: '2px solid black',
									marginTop: '0.5rem',
									borderRadius: '16px',
									boxShadow: 'none',
									'&:hover': {
										borderColor: 'black',
									},
								}),
							}}
						/>
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
