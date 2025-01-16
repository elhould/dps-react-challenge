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

	const [theme, setTheme] = useState(
		window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleThemeChange = () => {
			setTheme(mediaQuery.matches ? 'dark' : 'light');
		};
		mediaQuery.addEventListener('change', handleThemeChange);

		return () => {
			mediaQuery.removeEventListener('change', handleThemeChange);
		};
	}, []);

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
		<div className="app-container">
			<div className="content-container">
				<div>
					<a
						href="https://www.digitalproductschool.io/"
						target="_blank"
						rel="noreferrer"
					>
						<img src={dpsLogo} className="logo" alt="DPS logo" />
					</a>
				</div>

				{/* Card-like container */}
				<div className="card">
					<div className="filters-row">
						{/* Filter by name */}
						<div className="filter-group">
							<div className="filter-label">Name</div>
							<input
								type="text"
								className="filter-input"
								placeholder="Filter by name..."
								value={nameFilter}
								onChange={(e) => setNameFilter(e.target.value)}
							/>
						</div>

						{/* Filter by city */}
						<div className="filter-group">
							<div className="filter-label">City</div>
							<Select
								key={theme}
								options={cityOptions}
								placeholder="Select City..."
								isClearable
								value={cityOptions.find(
									(option) => option.value === cityFilter
								)}
								onChange={(selectedOption) =>
									setCityFilter(
										selectedOption
											? selectedOption.value
											: ''
									)
								}
								styles={{
									container: (provided) => ({
										...provided,
										width: '100%',
									}),
									control: (provided, state) => ({
										...provided,
										height: '50px',
										border: `2px solid var(--border-color)`,
										backgroundColor:
											'var(--background-color)',
										borderRadius: '16px',
										marginTop: '0.5rem',
										boxShadow: state.isFocused
											? '0 0 0 4px var(--highlight-color)'
											: 'none',
										'&:hover': {
											borderColor: 'black',
										},
									}),
									placeholder: (provided) => ({
										...provided,
										textAlign: 'left',
										color: window.matchMedia(
											'(prefers-color-scheme: dark)'
										).matches
											? 'var(--placeholder-dark)'
											: 'var(--placeholder-light)',
									}),
									singleValue: (provided) => ({
										...provided,
										textAlign: 'left',
										color: 'var(--text-color)',
									}),
									menu: (provided) => ({
										...provided,
										backgroundColor:
											'var(--background-color)',
										color: 'var(--text-color)',
									}),
									option: (provided, state) => ({
										...provided,
										backgroundColor: state.isFocused
											? 'var(--highlight-color)'
											: 'var(--background-color)',
										color: 'var(--text-color)',
										'&:active': {
											backgroundColor:
												'var(--highlight-color)',
											color: 'var(--background-color)',
										},
									}),
								}}
							/>
						</div>

						{/* Highlight oldest user per city */}
						<div className="checkbox-container">
							<label className="checkbox-label">
								Highlight oldest per city
								<input
									className="checkbox-scale"
									type="checkbox"
									checked={highlightOldestUserPerCity}
									onChange={(e) =>
										setHighlightOldestPerCity(
											e.target.checked
										)
									}
								/>
							</label>
						</div>
					</div>

					{/* Table container */}
					<div className="table-container">
						<table className="user-table">
							<thead>
								<tr
									className={
										filteredUsers.length > 0
											? 'table-header has-users'
											: 'table-header no-users'
									}
								>
									<th>Name</th>
									<th>City</th>
									<th>Birthday</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.map((user) => {
									const isOldest =
										highlightOldestUserPerCity &&
										oldestUsersPerCity[
											user.address.city
										]?.some((u) => u.id === user.id);

									return (
										<tr
											key={user.id}
											className={
												isOldest ? 'oldest-row' : ''
											}
										>
											<td>
												{user.firstName +
													' ' +
													user.lastName}
											</td>
											<td>{user.address.city}</td>
											<td>
												{formatDate(user.birthDate)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
