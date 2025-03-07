import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { jobsrapeDto } from './dto';
import * as puppeteer from 'puppeteer';

interface JobData {
  title: string;
  company: string;
  description: string;
  postedTime: string;
}

@Injectable()
export class JobScrapperService {
  private readonly logger = new Logger(JobScrapperService.name);

  constructor(private prisma: PrismaService) {}

  async scrapeJobs(data: jobsrapeDto): Promise<JobData[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const jobs: JobData[] = [];

    try {
      let currentPage = 1;
      let nextPage = true;

      while (nextPage) {
        await page.goto(`${data.platformUrl}?page=${currentPage}`, {
          waitUntil: 'networkidle2',
        });
        const pageJobs = await this.scrapePageJobs(page);

        jobs.push(...pageJobs);

        const nextButton = await page.$('.next-page-button');
        if (!nextButton) {
          nextPage = false;
        } else {
          currentPage++;
        }
      }

      await this.saveJobsToDatabase(jobs, data);
    } catch (error) {
      this.logger.error(`Error scraping jobs: ${error}`, error);
      throw new BadRequestException('Failed to scrape jobs');
    } finally {
      await browser.close();
    }

    return jobs;
  }

  private async scrapePageJobs(page: puppeteer.Page): Promise<JobData[]> {
    return page.evaluate((): JobData[] => {
      const jobElements = document.querySelectorAll('.job-listing');
      const jobs: JobData[] = [];

      jobElements.forEach((element) => {
        const title = element.querySelector('.title')?.textContent?.trim();
        const company = element.querySelector('.company')?.textContent?.trim();
        const description = element
          .querySelector('.description')
          ?.textContent?.trim();
        const postedTime = element.querySelector('.time')?.textContent?.trim();

        if (title && company && description && postedTime) {
          jobs.push({ title, company, description, postedTime });
        }
      });

      return jobs;
    });
  }

  private async saveJobsToDatabase(
    jobs: JobData[],
    data: jobsrapeDto,
  ): Promise<void> {
    for (const job of jobs) {
      try {
        await this.prisma.jobs.create({
          data: {
            title: job.title,
            company: job.company,
            description: job.description,
            postedTime: job.postedTime,
            platformUrl: data.platformUrl,
            category: data.category,
            keywords: data.keywords,
            userId: data.userId,
          },
        });
      } catch (error) {
        this.logger.error(`Error saving job to database: ${error}`, error);
        throw new BadRequestException('Failed to save jobs to database');
      }
    }
  }
}
