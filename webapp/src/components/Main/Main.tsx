import {Box, Button} from '@mui/material';
import NavBar from "./items/NavBar";

const Main = () => {

    return (
        <Box component="main" sx={{
            margin: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Box sx={{ width: '100%' }}>
                <NavBar />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', margin: 10}}>
                <Button sx={{backgroundColor: '#2F353B', color: 'white', padding: 2}}>Jugar</Button>
            </Box>
        </Box>

    );
};

export default Main;
