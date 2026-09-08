import { Test, TestingModule } from '@nestjs/testing';
import { QuestionPaperController } from './question-paper.controller';

describe('QuestionPaperController', () => {
  let controller: QuestionPaperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionPaperController],
    }).compile();

    controller = module.get<QuestionPaperController>(QuestionPaperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
