import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPaperService } from './question-paper.service';

describe('QuestionPaperService', () => {
  let service: QuestionPaperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionPaperService],
    }).compile();

    service = module.get<QuestionPaperService>(QuestionPaperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
