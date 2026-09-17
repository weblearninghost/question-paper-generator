import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Button,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import DownloadIcon from '@mui/icons-material/Download';

const QuestionPaperDetails = () => {
  const { paperId } = useParams();

  const [paper, setPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDownloadPdf = async () => {
    if (!paperId) return;

    try {
      console.log('DOWNLOADING QUESTION PAPER:', paperId);

      const response = await api.get(`/question-papers/${paperId}/pdf`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `question-paper-${paperId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('FAILED TO DOWNLOAD PDF:', error);

      setError(
        error.response?.data?.message ||
          'Failed to download question paper PDF.',
      );
    }
  };

  const handleDownloadAnswerSheet = async () => {
    if (!paperId) return;

    try {
      console.log('DOWNLOADING ANSWER SHEET:', paperId);

      const response = await api.get(
        `/question-papers/${paperId}/answer-sheet/pdf`,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `answer-sheet-${paperId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('FAILED TO DOWNLOAD ANSWER SHEET:', error);

      setError(
        error.response?.data?.message || 'Failed to download answer sheet.',
      );
    }
  };

  useEffect(() => {
    if (!paperId) {
      setError('Question paper ID is missing.');
      setLoading(false);
      return;
    }

    const loadPaper = async () => {
      try {
        console.log('LOADING QUESTION PAPER:', paperId);

        const response = await api.get(`/question-papers/${paperId}`);

        console.log('QUESTION PAPER RESPONSE:', response.data);

        setPaper(response.data);
      } catch (error: any) {
        console.error('FAILED TO LOAD QUESTION PAPER:', error);

        console.error('STATUS:', error.response?.status);

        console.error('BACKEND ERROR:', error.response?.data);

        setError(
          error.response?.data?.message || 'Failed to load question paper.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaper();
  }, [paperId]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1100, mx: 'auto', p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!paper) {
    return null;
  }

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: 'auto',
        p: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              {paper.title}
            </Typography>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
            <Button variant="outlined" onClick={handleDownloadAnswerSheet}>
              Download Answer Sheet
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Class
              </Typography>

              <Typography fontWeight={600}>{paper.class?.name}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Subject
              </Typography>

              <Typography fontWeight={600}>{paper.subject?.name}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Medium
              </Typography>

              <Typography fontWeight={600}>{paper.medium}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Duration
              </Typography>

              <Typography fontWeight={600}>
                {paper.durationMinutes} min
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Total Marks
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              {paper.totalMarks}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Questions
          </Typography>

          {paper.questions?.map((item: any) => (
            <Box
              key={item.id}
              sx={{
                mb: 3,
                pb: 3,
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography fontWeight={600}>
                  {item.questionNo}. {item.question?.questionText}
                </Typography>

                <Typography
                  fontWeight={600}
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  [{item.marks}]
                </Typography>
              </Box>

              {/* MCQ Options */}
            {item.question?.type === "MCQ" && (
  <Box
    sx={{
      mt: 1.5,
      ml: 3,
      textAlign: "left",
    }}
  >
    {item.question.options?.map(
      (option: any) => (
        <Typography
          key={option.id}
          sx={{
            mb: 0.5,
            textAlign: "left",
          }}
        >
          {option.optionKey}. {option.optionText}
        </Typography>
      ),
    )}
  </Box>
)}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuestionPaperDetails;
