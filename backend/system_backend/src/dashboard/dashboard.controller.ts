import { Controller, Get, Query, ParseIntPipe, NotFoundException, Optional } from '@nestjs/common'; // Added Optional
import { DashboardService } from './dashboard.service';

// The base path for all dashboard-related endpoints
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /api/dashboard/summary
   * Fetches a high-level summary of queue metrics for a specific branch.
   * @param branchId The ID of the branch to retrieve summary for.
   * @returns An object containing total queued, served, requeues, and cancelled tickets.
   */
  @Get('summary')
  async getDashboardSummary(@Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number) { // Made ParseIntPipe optional
    // No explicit check needed here, service handles optional branchId
    return this.dashboardService.getDashboardSummary(branchId);
  }

  /**
   * GET /api/dashboard/queues
   * Fetches a list of currently active (queued) tickets for a specific branch.
   * @param branchId The ID of the branch to retrieve active queues for.
   * @returns An array of simplified queue ticket objects.
   */
  @Get('queues')
  async getQueuesData(@Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number) { // Made ParseIntPipe optional
    // No explicit check needed here, service handles optional branchId
    return this.dashboardService.getQueuesData(branchId);
  }

  /**
   * GET /api/dashboard/windows-assigned
   * Fetches the status of service windows, including assigned staff and their current queue counts, for a specific branch.
   * @param branchId The ID of the branch to retrieve window assignments for.
   * @returns An array of objects detailing each window's status.
   */
  @Get('windows-assigned')
  async getWindowsAssignedData(@Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number) { // Made ParseIntPipe optional
    // No explicit check needed here, service handles optional branchId
    return this.dashboardService.getWindowsAssignedData(branchId);
  }

  /**
   * GET /api/dashboard/queue-history
   * Fetches a historical summary of queue tickets, categorized by type (PWD, Senior Citizen, Standard) and status (cancelled),
   * for a specific branch and an optional time period/date range.
   * @param branchId Optional. The ID of the branch to retrieve history for.
   * @param period Optional. The predefined period ('day', 'week', 'month', 'year'). Defaults to 'day'.
   * @param startDate Optional. Custom start date in YYYY-MM-DD format.
   * @param endDate Optional. Custom end date in YYYY-MM-DD format.
   * @returns An object containing counts for various queue categories and statuses.
   */
  @Get('queue-history')
  async getQueueHistoryData(
    @Query('branchId', new ParseIntPipe({ optional: true })) branchId?: number, // CRITICAL FIX: Made ParseIntPipe optional
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Removed the 'if (!branchId)' check because the service is designed to handle an optional branchId
    return this.dashboardService.getQueueHistoryData(branchId, period, startDate, endDate);
  }
}
