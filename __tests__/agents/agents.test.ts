import { imageCreatorAgent } from '../../agents/imageCreatorAgent';
import { ghostwriterAgent } from '../../agents/ghostwriterAgent';
import { qualityReviewerAgent } from '../../agents/qualityReviewerAgent';

describe('Agent Configuration', () => {
  describe('imageCreatorAgent', () => {
    it('should have correct configuration', () => {
      expect(imageCreatorAgent.name).toBe('Image Creator Agent');
      expect(imageCreatorAgent.model).toBe('gpt-4o');
      expect(imageCreatorAgent.tools).toHaveLength(2);
    });

    it('should have clear instructions', () => {
      expect(imageCreatorAgent.instructions).toContain('image creator');
      expect(imageCreatorAgent.instructions).toContain('generate_image');
      expect(imageCreatorAgent.instructions).toContain('download_image');
    });
  });

  describe('ghostwriterAgent', () => {
    it('should have correct configuration', () => {
      expect(ghostwriterAgent.name).toBe('Ghostwriter Agent');
      expect(ghostwriterAgent.model).toBe('gpt-4o');
    });

    it('should have appropriate model settings', () => {
      expect(ghostwriterAgent.modelSettings).toBeDefined();
      expect(ghostwriterAgent.modelSettings?.temperature).toBe(1);
    });
  });

  describe('qualityReviewerAgent', () => {
    it('should have correct configuration', () => {
      expect(qualityReviewerAgent.name).toBe('Quality Reviewer Agent');
      expect(qualityReviewerAgent.model).toBe('gpt-4o');
    });

    it('should have review-focused instructions', () => {
      expect(qualityReviewerAgent.instructions).toContain('quality reviewer');
      expect(qualityReviewerAgent.instructions).toContain('Grammar');
      expect(qualityReviewerAgent.instructions).toContain('spelling');
    });
  });
});
