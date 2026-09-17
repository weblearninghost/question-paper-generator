import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

const QuestionPapers = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Question Papers
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Create and manage question papers
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/question-papers/create')}
        >
          Create Question Paper
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            No question papers yet
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Create your first question paper to get started.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuestionPapers;
