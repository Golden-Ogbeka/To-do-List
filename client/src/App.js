import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import React from 'react';
import { Close, Delete } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import {
	IconButton,
	Snackbar,
	AppBar,
	Toolbar,
	Box,
	TextField,
	Button,
	Divider,
	Card,
	CardHeader,
	CardActions,
	CircularProgress,
} from '@material-ui/core';
import axios from 'axios';
import { base_url } from './app.json';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const useStyles = makeStyles((theme) => ({
	root: {
		fontFamily: 'Calibri',
		fontWeight: 'normal',
		color: '#000000',
		backgroundColor: '#FFFFFF',
	},
	form: {
		'& > *': {
			marginBlock: theme.spacing(1),
			width: '100%',
		},
	},
}));

function App() {
	const classes = useStyles();

	// Snackbar state (For response)
	const [snackbarState, setSnackbarState] = React.useState({
		open: false,
		type: 'error',
		message: '',
	});

	// Tasks state
	const [tasks, setTasks] = React.useState([]);

	// Loading state
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const getTasks = async () => {
			try {
				const response = await axios.get(`${base_url}/api/tasks`);
				setTasks(response.data);

				setLoading(false);
			} catch (error) {
				setSnackbarState({
					...snackbarState,
					open: true,
					type: 'error',
					message: "Couldn't retrieve tasks",
				});
				setLoading(false);
			}
		};
		getTasks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const toggleSnackbar = () =>
		setSnackbarState({
			...snackbarState,
			open: !snackbarState,
		});

	// Formik settings
	const formik = useFormik({
		initialValues: {
			title: '',
			content: '',
		},
		validationSchema: Yup.object({
			title: Yup.string().required('Title is required'),
			content: Yup.string().required('Content is required'),
		}),
		onSubmit: (values) => {
			addTask(values);
		},
		enableReinitialize: true,
	});

	const addTask = async (values) => {
		try {
			const response = await axios.post(`${base_url}/api/task`, values);
			setTasks([
				...tasks,
				{
					_id: response.data,
					title: values.title,
					content: values.content,
				},
			]);
			setSnackbarState({
				...snackbarState,
				open: true,
				type: 'success',
				message: 'Task Added',
			});
		} catch (error) {
			setSnackbarState({
				...snackbarState,
				open: true,
				type: 'error',
				message: "Couldn't add task",
			});
		}
	};

	const deleteTask = async (taskID) => {
		try {
			const response = await axios.delete(`${base_url}/api/task?taskID=${taskID}`);
			setTasks(tasks.filter((task) => task._id !== taskID));
			setSnackbarState({
				...snackbarState,
				open: true,
				type: 'success',
				message: response.data,
			});
		} catch (error) {
			console.log(error);
			setSnackbarState({
				...snackbarState,
				open: true,
				type: 'error',
				message: "Couldn't delete task",
			});
		}
	};

	return (
		<div className={classes.root}>
			{/* Navbar */}
			<AppBar
				position='static'
				style={{
					backgroundColor: '#1976D2',
					boxShadow: 'none',
				}}
			>
				<Toolbar>
					<h4
						style={{
							fontFamily: 'Calibri',
							fontWeight: 'normal',
							fontSize: 19,
							margin: 0,
							flexGrow: 1,
						}}
					>
						To-do List
					</h4>
					<h4
						style={{
							fontFamily: 'Calibri',
							fontWeight: 'lighter',
							fontSize: 12,
							margin: 0,
						}}
					>
						by Golden Ogbeka
					</h4>
				</Toolbar>
			</AppBar>
			<Box style={{ minHeight: '100vh', padding: 20 }}>
				<Box>
					<h2
						style={{
							fontFamily: 'Calibri',
							marginTop: 0,
						}}
					>
						Add new task
					</h2>
					<form className={classes.form} onSubmit={formik.handleSubmit}>
						<TextField
							label='Title'
							variant='outlined'
							required
							type='text'
							id='title'
							name='title'
							placeholder="Enter tasks' title"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.title || ''}
							error={formik.touched.title && formik.errors.title}
							helperText={
								formik.touched.title && formik.errors.title && formik.errors.title
							}
							fullWidth
						/>
						<TextField
							label='Content'
							variant='outlined'
							required
							type='text'
							id='content'
							name='content'
							placeholder="Enter tasks' content"
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							value={formik.values.content || ''}
							error={formik.touched.content && formik.errors.content}
							helperText={
								formik.touched.content && formik.errors.content && formik.errors.content
							}
							multiline
							fullWidth
						/>
						<Button
							variant='contained'
							style={{
								width: 173,
								height: 57,
								borderRadius: 4,

								color: '#FFFFFF',
								backgroundColor: '#1976D2',
							}}
							type='submit'
						>
							Add Task
						</Button>
					</form>
				</Box>
				<Divider
					style={{
						marginBlock: 20,
					}}
				/>
				<Box>
					<h2
						style={{
							fontFamily: 'Calibri',
							marginTop: 0,
						}}
					>
						Your Tasks
					</h2>

					{loading ? (
						<CircularProgress />
					) : tasks && tasks.length > 0 ? (
						tasks.map((task) => (
							<Card
								style={{
									display: 'flex',
									marginBottom: 20,
								}}
							>
								<CardHeader
									title={task.title}
									subheader={task.content}
									style={{
										flexGrow: 1,
									}}
								/>
								<CardActions>
									<IconButton onClick={() => deleteTask(task._id)}>
										<Delete
											style={{
												color: '#FB4E4E',
											}}
										/>
									</IconButton>
								</CardActions>
							</Card>
						))
					) : (
						<span
							style={{
								fontFamily: 'Calibri',
								fontSize: 16,
							}}
						>
							No task found
						</span>
					)}
				</Box>
			</Box>
			<Snackbar
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				autoHideDuration={5000}
				open={snackbarState.open}
				onClose={toggleSnackbar}
				action={
					<IconButton
						size='small'
						aria-label='close'
						color='inherit'
						onClick={toggleSnackbar}
					>
						<Close fontSize='small' />
					</IconButton>
				}
			>
				<Alert
					onClose={toggleSnackbar}
					severity={snackbarState.type}
					variant='filled'
				>
					{snackbarState.message}
				</Alert>
			</Snackbar>
		</div>
	);
}

export default App;
